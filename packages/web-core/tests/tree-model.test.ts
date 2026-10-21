import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TreeAdapter } from '../src/tree/foundation.ts';
import type { TreeData, TreeModelNode, TreeNodeKey } from '../src/tree/types.ts';

import { getCheckedStateByInitKeys } from '../dist/tree/check.js';
import { generateTreeData } from '../dist/tree/data.js';
import { createTreeFoundation } from '../dist/tree/foundation.js';
import { getTreeKeyAction } from '../dist/tree/keyboard.js';
import {
  getDefaultExpandedKeys,
  getFlattenTreeData,
  getKey2TreeNode,
  getPublicCheckedKeys,
  getVisibleTreeNodes,
  getTransitionTreeNodes,
} from '../dist/tree/query.js';

const options = {
  selectable: true,
  checkable: true,
  blockNode: false,
  showLine: true,
  loadMore: false,
  draggable: false,
};

test('modeling maps fields while preserving raw payloads, render values and capability callbacks', () => {
  const render = () => ({ renderer: 'opaque' });
  const leaf = { id: 'leaf', label: 'Leaf', icon: render, selectable: false };
  const raw = [
    { id: 0, label: 'Root', nodes: [leaf] },
    { id: '0', label: 'Other' },
  ];
  const calls: unknown[] = [];
  const tree = generateTreeData(raw, {
    ...options,
    fieldNames: { key: 'id', title: 'label', children: 'nodes' },
    selectable(node, info) {
      calls.push([node, info]);
      return true;
    },
  });
  const root = tree[0];
  const child = root.children![0];
  assert.equal(root.treeNodeData, raw[0]);
  assert.equal(child.treeNodeData, leaf);
  assert.equal(child.treeNodeProps.icon, render);
  assert.equal(child.parent, root);
  assert.deepEqual(child.pathParentKeys, [0]);
  assert.deepEqual(child.lineless, [false]);
  assert.equal(child.level, 1);
  assert.equal(child.selectable, false);
  assert.equal(child.isLeaf, true);
  assert.equal('children' in root.treeNodeProps, false);
  assert.equal('id' in root.treeNodeProps, false);
  assert.equal(raw[0].nodes?.[0], leaf);
  assert.deepEqual(calls, [
    [raw[0], { level: 0, isLeaf: false }],
    [raw[1], { level: 0, isLeaf: true }],
  ]);
  const indexed = getKey2TreeNode(getFlattenTreeData(tree));
  assert.equal(indexed.get(0)?.title, 'Root');
  assert.equal(indexed.get('0')?.title, 'Other');
  const opaqueTitle = { renderer: 'future-adapter' };
  assert.equal(generateTreeData([{ title: opaqueTitle }], options)[0].title, opaqueTitle);
});

test('keyless repeated objects retain separate occurrence keys across data rebuilds', () => {
  const shared = { title: 'Shared' };
  const raw = [
    { key: 'one', children: [shared] },
    { key: 'two', children: [shared] },
  ];
  const cache = new WeakMap<TreeData, TreeNodeKey[]>();
  const first = getFlattenTreeData(generateTreeData(raw, options, cache));
  const second = getFlattenTreeData(generateTreeData(raw, options, cache));
  assert.notEqual(first[1].key, first[3].key);
  assert.deepEqual(
    second.map((node) => node.key),
    first.map((node) => node.key),
  );
  assert.equal(first[1].treeNodeData, first[3].treeNodeData);
  const lazy = generateTreeData([{ key: 'unloaded' }, { key: 'leaf', isLeaf: true }], {
    ...options,
    loadMore: true,
  });
  assert.equal(lazy[0].isLeaf, false);
  assert.equal(lazy[1].isLeaf, true);
});

function fixture() {
  const raw: TreeData[] = [{ key: 'root', children: [{ key: 0 }, { key: '0' }] }];
  const state = {
    nodes: getKey2TreeNode(getFlattenTreeData(generateTreeData(raw, options))),
    selected: [] as TreeNodeKey[],
    checked: [] as TreeNodeKey[],
    half: [] as TreeNodeKey[],
    expanded: [] as TreeNodeKey[],
    expanding: [] as TreeNodeKey[],
    loading: [] as TreeNodeKey[],
    multiple: false,
    strict: false,
    animate: false,
    controlledExpanded: false,
    strategy: 'all' as 'all' | 'parent' | 'child',
    loader: undefined as undefined | ((node: TreeData) => Promise<void>),
  };
  const events: { name: string; keys?: TreeNodeKey[]; data?: unknown }[] = [];
  const adapter: TreeAdapter<TreeData, TreeModelNode, object> = {
    getNodes: () => state.nodes,
    getSelectedKeys: () => state.selected,
    getCheckedKeys: () => state.checked,
    getIndeterminateKeys: () => state.half,
    getExpandedKeys: () => state.expanded,
    getExpandingKeys: () => state.expanding,
    getLoadingKeys: () => state.loading,
    getMultiple: () => state.multiple,
    getCheckStrictly: () => state.strict,
    getCheckedStrategy: () => state.strategy,
    getAnimateExpand: () => state.animate,
    getLoadMore: () => state.loader,
    setSelectedKeys: (keys) => {
      state.selected = keys;
    },
    setCheckedState: (keys, halfKeys, reinitialize) => {
      [state.checked, state.half] = reinitialize
        ? getCheckedStateByInitKeys({
            initCheckedKeys: keys,
            key2TreeNode: state.nodes,
            checkStrictly: state.strict,
          })
        : [keys, halfKeys];
      return [state.checked, state.half];
    },
    setExpandedKeys: (keys) => {
      events.push({ name: 'setExpanded', keys });
      if (!state.controlledExpanded) state.expanded = keys;
    },
    setExpandingKeys: (keys) => {
      state.expanding = keys;
    },
    setLoadingKeys: (keys) => {
      state.loading = keys;
    },
    onLoadError: (error) => {
      events.push({ name: 'loadError', data: error });
    },
    events: {
      updateSelected: (keys) => {
        events.push({ name: 'updateSelected', keys });
      },
      select: (keys, data) => {
        events.push({ name: 'select', keys, data });
      },
      updateChecked: (keys) => {
        events.push({ name: 'updateChecked', keys });
      },
      updateHalfChecked: (keys) => {
        events.push({ name: 'updateHalfChecked', keys });
      },
      check: (keys, data) => {
        events.push({ name: 'check', keys, data });
      },
      updateExpanded: (keys) => {
        events.push({ name: 'updateExpanded', keys });
      },
      expand: (keys, data) => {
        events.push({ name: 'expand', keys, data });
      },
    },
  };
  return { raw, state, events, adapter, actions: createTreeFoundation(adapter) };
}

test('default expansion preserves explicit empty keys, ancestor ordering and strategy priority', () => {
  const { state } = fixture();
  const initial = {
    nodes: [...state.nodes.values()],
    key2TreeNode: state.nodes,
    autoExpandParent: true,
    defaultExpandAll: true,
    defaultExpandSelected: true,
    defaultExpandChecked: true,
    selectedKeys: [0],
    checkedKeys: ['0'],
  };
  assert.deepEqual(getDefaultExpandedKeys({ ...initial, defaultExpandedKeys: [] }), []);
  assert.deepEqual(
    getDefaultExpandedKeys({ ...initial, defaultExpandedKeys: [0, 'missing', '0', 0] }),
    ['root', 0, '0'],
  );
  assert.deepEqual(
    getDefaultExpandedKeys({ ...initial, autoExpandParent: false, defaultExpandedKeys: [0] }),
    [0],
  );
  assert.deepEqual(getDefaultExpandedKeys(initial), ['root']);
  assert.deepEqual(getDefaultExpandedKeys({ ...initial, defaultExpandAll: false }), ['root']);
});

test('visibility honors expansion transitions and deduplicates after all filter callbacks', () => {
  const { state } = fixture();
  const nodes = [...state.nodes.values()];
  const input = {
    nodes: [...nodes, nodes[1]],
    expandedKeys: ['root'],
    expandingKeys: [] as TreeNodeKey[],
  };
  assert.deepEqual(
    getVisibleTreeNodes(input).map((node) => node.key),
    ['root', 0, '0'],
  );
  assert.deepEqual(
    getVisibleTreeNodes({ ...input, expandingKeys: ['root'] }).map((node) => node.key),
    ['root'],
  );
  const calls: TreeNodeKey[] = [];
  assert.deepEqual(
    getVisibleTreeNodes({
      ...input,
      filter: (node: TreeData) => {
        calls.push(node.key!);
        return node.key !== 'root';
      },
    }).map((node) => node.key),
    [0, '0'],
  );
  assert.deepEqual(calls, ['root', 0, '0', 0]);
  // A callback may update a previous node; key deduplication runs only after filtering.
  const changed = getVisibleTreeNodes({
    ...input,
    filter: (node: TreeData) => {
      if (node.key === '0') nodes[0].key = '0';
      return true;
    },
  });
  assert.deepEqual(changed, [nodes[0], nodes[1]]);
});

test('checked result strategies retain the existing missing-key and immediate-parent semantics', () => {
  const { state } = fixture();
  const keys = ['root', 0, '0', 'missing'];
  assert.deepEqual(getPublicCheckedKeys(keys, 'parent', state.nodes), ['root']);
  assert.deepEqual(getPublicCheckedKeys(keys, 'child', state.nodes), [0, '0', 'missing']);
  assert.deepEqual(getPublicCheckedKeys(keys, 'all', state.nodes), keys);
});

test('selection distinguishes single replacement from multiple toggling and preserves update-first events', () => {
  const { state, actions, events } = fixture();
  const event = { source: 'test' };
  actions.select(0, event);
  actions.select(0, event);
  assert.deepEqual(state.selected, [0]);
  assert.deepEqual(
    events.map((entry) => entry.name),
    ['updateSelected', 'select', 'updateSelected', 'select'],
  );
  assert.deepEqual(events[1].data, {
    selected: true,
    node: state.nodes.get(0)!.treeNodeData,
    selectedNodes: [state.nodes.get(0)!.treeNodeData],
    e: event,
  });
  state.multiple = true;
  actions.select(0, event);
  assert.deepEqual(state.selected, []);
  actions.selectNodes([0, '0'], true);
  assert.deepEqual(state.selected, [0, '0']);
  assert.equal((events.at(-1)!.data as { selected?: boolean }).selected, undefined);
});

test('expansion preserves animation locks, controlled reads and expand-before-update events', () => {
  const { state, actions, events } = fixture();
  state.animate = true;
  actions.expand(true, 'root');
  assert.deepEqual(
    events.map((entry) => entry.name),
    ['setExpanded', 'expand', 'updateExpanded'],
  );
  const expanding = state.expanding;
  actions.expand(false, 'root');
  assert.equal(events.length, 3);
  actions.endExpand('root');
  assert.notEqual(state.expanding, expanding);
  assert.deepEqual(expanding, ['root']);
  assert.deepEqual(state.expanding, []);
  state.controlledExpanded = true;
  actions.expand(false, 'root');
  assert.deepEqual(state.expanded, ['root']);
  assert.deepEqual(events.at(-1)?.keys, []);
  actions.setExpandedKeys([]);
  assert.deepEqual(state.expanding, []);
});

test('linked checks publish public keys and half state in the original order', () => {
  const { state, actions, events } = fixture();
  actions.check(true, 0);
  assert.deepEqual(state.checked, [0]);
  assert.deepEqual(state.half, ['root']);
  assert.deepEqual(
    events.map((entry) => entry.name),
    ['updateChecked', 'updateHalfChecked', 'check'],
  );
  state.strategy = 'parent';
  actions.check(true, '0');
  assert.deepEqual(events.at(-3)?.keys, ['root']);
  assert.deepEqual(actions.publicCheckedKeys(state.checked, 'child'), [0, '0']);
  actions.setCheckedKeys(['missing']);
  assert.deepEqual(state.checked, []);
});

test('load-more deduplicates pending work then rechecks freshly modeled descendants', async () => {
  const { raw, state, actions, events } = fixture();
  let release!: () => void;
  let loads = 0;
  state.checked = ['root'];
  state.loader = async (node) => {
    assert.equal(node, raw[0]);
    loads++;
    await new Promise<void>((resolve) => {
      release = resolve;
    });
  };
  const pending = actions.loadMore('root');
  await actions.loadMore('root');
  assert.equal(loads, 1);
  assert.deepEqual(state.loading, ['root']);
  raw[0].children!.push({ key: 'new' });
  state.nodes = getKey2TreeNode(getFlattenTreeData(generateTreeData(raw, options)));
  release();
  await pending;
  assert.deepEqual(state.loading, []);
  assert.deepEqual(state.expanded, ['root']);
  assert.ok(state.checked.includes('new'));
  assert.deepEqual(
    events.map((entry) => entry.name),
    ['setExpanded', 'expand', 'updateExpanded', 'updateChecked', 'updateHalfChecked', 'check'],
  );
});

test('load failures clear only their loading key and use the adapter error sink', async () => {
  const { state, actions, events } = fixture();
  const error = new Error('load failed');
  state.loading = ['other'];
  state.loader = async () => {
    throw error;
  };
  await actions.loadMore('root');
  assert.deepEqual(state.loading, ['other']);
  assert.deepEqual(events, [{ name: 'loadError', data: error }]);
});

test('keyboard planning preserves disabled checks, parent navigation and lazy expansion', () => {
  const { state } = fixture();
  const nodes = [...state.nodes.values()];
  const input = {
    key: 'root',
    eventKey: 'ArrowRight',
    visibleNodes: nodes,
    expandedKeys: [] as TreeNodeKey[],
    canLoadMore: true,
  };
  assert.deepEqual(getTreeKeyAction(input), { type: 'expand', key: 'root', expanded: true });
  assert.deepEqual(getTreeKeyAction({ ...input, expandedKeys: ['root'] }), {
    type: 'focus',
    key: 0,
  });
  assert.deepEqual(getTreeKeyAction({ ...input, key: 0, eventKey: 'ArrowLeft' }), {
    type: 'focus',
    key: 'root',
  });
  assert.deepEqual(getTreeKeyAction({ ...input, key: 'root', eventKey: 'ArrowUp' }), {
    type: 'prevent',
  });
  assert.deepEqual(getTreeKeyAction({ ...input, key: 'root', eventKey: ' ' }), {
    type: 'check',
    key: 'root',
  });
  nodes[0].disableCheckbox = true;
  assert.deepEqual(getTreeKeyAction({ ...input, eventKey: 'Enter' }), {
    type: 'select',
    key: 'root',
  });
  nodes[0].disabled = true;
  assert.equal(getTreeKeyAction({ ...input, eventKey: 'Enter' }), undefined);
  nodes[0].children = undefined;
  assert.deepEqual(getTreeKeyAction(input), { type: 'load', key: 'root' });
  assert.equal(getTreeKeyAction({ ...input, key: 'unknown' }), undefined);
});

test('public batch commands apply capability guards and retain single-target event metadata', () => {
  const { state, actions, events } = fixture();
  state.nodes.get(0)!.disabled = true;
  actions.selectAll();
  assert.deepEqual(state.selected, ['root']);
  actions.selectNode([0], true);
  assert.deepEqual(state.selected, ['root']);
  actions.checkNode('root', true, true);
  assert.deepEqual(state.checked, []);
  actions.checkNode('0');
  assert.ok(state.checked.includes('0'));
  assert.equal((events.at(-1)!.data as { checked?: boolean }).checked, true);
  actions.checkAll(false);
  assert.deepEqual(state.checked, []);
  actions.expandNode('0');
  assert.deepEqual(state.expanded, []);
  // expandNode always publishes its command, even if capability filtering leaves no keys.
  assert.equal((events.at(-2)!.data as { expanded?: boolean }).expanded, true);
  actions.expandNode(['root']);
  assert.deepEqual(state.expanded, ['root']);
  assert.equal((events.at(-2)!.data as { expanded?: boolean }).expanded, undefined);
  actions.expandAll(false);
  assert.deepEqual(state.expanded, []);
});

test('collapse animation keeps expanded descendants without requiring the closing branch to stay expanded', () => {
  const { state } = fixture();
  const nodes = [...state.nodes.values()];
  const input = { nodes, nodeKey: 'root', expandedKeys: [] as TreeNodeKey[], expanded: false };
  assert.deepEqual(
    getTransitionTreeNodes(input)?.map((node) => node.key),
    [0, '0'],
  );
  assert.deepEqual(getTransitionTreeNodes({ ...input, expanded: true }), []);
  assert.deepEqual(
    getTransitionTreeNodes({ ...input, expanded: true, expandedKeys: ['root'] })?.map(
      (node) => node.key,
    ),
    [0, '0'],
  );
  assert.equal(getTransitionTreeNodes({ ...input, nodes: undefined }), undefined);
});
