import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TreeSelectAdapter } from '../src/tree-select/foundation.ts';
import type { FallbackOption, LabelValue } from '../src/tree-select/types.ts';
import type { TreeData, TreeNodeKey } from '../src/tree/types.ts';

import { getFilteredTreeKeys, matchTreeNodeKey } from '../dist/tree-select/filter.js';
import { createTreeSelectFoundation } from '../dist/tree-select/foundation.js';
import { createTreeSelectValues, getKeys } from '../dist/tree-select/values.js';
import { generateTreeData } from '../dist/tree/data.js';
import { getFlattenTreeData, getKey2TreeNode } from '../dist/tree/query.js';

function fixture() {
  const raw: TreeData[] = [
    {
      key: 'root',
      title: 'Parent',
      children: [
        { key: 0, title: 'Zero' },
        { key: 'leaf', title: 'Leaf' },
      ],
    },
  ];
  const nodes = getFlattenTreeData(
    generateTreeData(raw, {
      selectable: true,
      checkable: true,
      draggable: false,
      blockNode: false,
      showLine: false,
      loadMore: false,
    }),
  );
  const map = getKey2TreeNode(nodes);
  const state = {
    showPath: false,
    separator: undefined as string | undefined,
    multiple: false,
    checkable: false,
    fallback: true as FallbackOption<TreeData>,
    fieldNames: undefined as { title?: string } | undefined,
  };
  const values = createTreeSelectValues({
    getNodes: () => map,
    getShowPath: () => state.showPath,
    getFieldNames: () => state.fieldNames,
    getSeparator: () => state.separator,
    getMultiple: () => state.multiple,
    getCheckable: () => state.checkable,
    getFallbackOption: () => state.fallback,
  });
  return { raw, nodes, map, state, values };
}

test('normalization keeps numeric zero and rejects empty keys before applying single selection', () => {
  const { state, values } = fixture();
  assert.deepEqual(values.normalizeValue(['', { value: '', label: 'Empty' }, 0, 'leaf']), [0]);
  state.checkable = true;
  assert.deepEqual(getKeys(values.normalizeValue(['', 0, { value: 'leaf', label: 'Custom' }])), [
    0,
    'leaf',
  ]);
});

test('labels preserve explicit empty text, fresh node titles, custom path fields and origin fallback', () => {
  const { map, state, values } = fixture();
  assert.deepEqual(values.getLabelValues([{ value: 'leaf', label: '' }]), [
    { value: 'leaf', label: '' },
  ]);
  assert.deepEqual(values.getLabelValues(['leaf'], [{ value: 'leaf', label: 'Old' }]), [
    { value: 'leaf', label: 'Leaf' },
  ]);
  map.get('root')!.treeNodeData.caption = 17;
  map.get('leaf')!.treeNodeData.caption = 'Mapped';
  state.showPath = true;
  state.fieldNames = { title: 'caption' };
  state.separator = ' > ';
  assert.deepEqual(values.getLabelValues(['leaf']), [{ value: 'leaf', label: '17 > Mapped' }]);
  assert.deepEqual(
    values.getLabelValues(['missing'], [{ value: 'missing', label: 'Remembered' }]),
    [{ value: 'missing', label: 'Remembered' }],
  );
});

test('fallback options can hide unknown values or resolve mapped labels without replacing keys', () => {
  const { state, values } = fixture();
  state.fallback = false;
  assert.deepEqual(values.getLabelValues(['missing']), []);
  state.fieldNames = { title: 'caption' };
  let calls = 0;
  state.fallback = (key) => {
    calls++;
    return { caption: `Fallback:${key}` };
  };
  const normalized = values.normalizeValue('missing');
  const keys = getKeys(normalized);
  assert.deepEqual(values.getLabelValues(keys, values.getLabelValues(normalized)), [
    { value: 'missing', label: 'Fallback:missing' },
  ]);
  assert.equal(calls, 2);
  assert.deepEqual(keys, ['missing']);
});

test('search retains matching raw keys and their ancestor insertion order', () => {
  const { nodes } = fixture();
  const calls: TreeNodeKey[] = [];
  const keys = getFilteredTreeKeys(nodes, 'leaf', (keyword, node: TreeData) => {
    calls.push(node.key!);
    return matchTreeNodeKey(node, keyword, 'key');
  });
  assert.deepEqual([...keys], ['leaf', 'root']);
  assert.deepEqual(calls, ['root', 0, 'leaf']);
  assert.equal(matchTreeNodeKey({ id: 0 }, '0', 'id'), true);
  assert.equal(matchTreeNodeKey({ id: undefined }, '', 'id'), false);
});

function controllerFixture() {
  const data = fixture();
  const local = {
    keys: [] as TreeNodeKey[],
    labels: [] as LabelValue[],
    disabled: false,
    readonly: false,
    labelInValue: false,
    strict: false,
    input: 'query',
    retain: false,
  };
  const scheduled: (() => void)[] = [];
  const events: { name: string; value?: unknown }[] = [];
  const adapter: TreeSelectAdapter<TreeData, (typeof data.nodes)[number]> = {
    getNodes: () => data.map,
    getDisabled: () => local.disabled,
    getReadonly: () => local.readonly,
    getMultiple: () => data.state.multiple,
    getCheckable: () => data.state.checkable,
    getCheckStrictly: () => local.strict,
    getLabelInValue: () => local.labelInValue,
    getSelectedKeys: () => local.keys,
    getLocalKeys: () => local.keys,
    getLocalValues: () => local.labels,
    getInputValue: () => local.input,
    getRetainInput: () => local.retain,
    setLocalKeys: (keys) => {
      local.keys = keys;
    },
    setPanelVisible: (value) => {
      events.push({ name: 'panel', value });
    },
    updateInputValue: (value) => {
      local.input = value;
      events.push({ name: 'input', value });
    },
    afterRender: (callback) => {
      scheduled.push(callback);
    },
    onFormChange: () => {
      events.push({ name: 'form' });
    },
    events: {
      updateValue: (value) => {
        events.push({ name: 'update', value });
      },
      change: (value) => {
        events.push({ name: 'change', value });
      },
      clear: () => {
        events.push({ name: 'clear' });
      },
    },
  };
  return { ...data, local, events, scheduled, actions: createTreeSelectFoundation(adapter) };
}

test('selection resets search immediately and publishes settled labels after adapter rendering', () => {
  const { actions, local, events, scheduled } = controllerFixture();
  actions.select(['leaf']);
  assert.deepEqual(local.keys, ['leaf']);
  assert.deepEqual(events, [
    { name: 'input', value: '' },
    { name: 'panel', value: false },
  ]);
  local.labelInValue = true;
  local.labels = [{ value: 'leaf', label: 'Settled' }];
  scheduled[0]();
  assert.deepEqual(events.slice(-3), [
    { name: 'update', value: local.labels[0] },
    { name: 'change', value: local.labels[0] },
    { name: 'form' },
  ]);
});

test('clearing keeps search text and emits clear before deferred model and form notifications', () => {
  const { actions, local, events, scheduled } = controllerFixture();
  local.keys = ['leaf'];
  actions.clear();
  assert.equal(local.input, 'query');
  assert.deepEqual(events, [{ name: 'clear' }]);
  scheduled[0]();
  assert.deepEqual(events, [
    { name: 'clear' },
    { name: 'update', value: undefined },
    { name: 'change', value: undefined },
    { name: 'form' },
  ]);
});

test('readonly and disabled guards reject edits; checked tag removal follows linked tree rules', () => {
  const { actions, local, state, events, scheduled } = controllerFixture();
  local.readonly = true;
  actions.select(['leaf']);
  actions.clear();
  actions.remove('leaf');
  assert.deepEqual(events, []);
  assert.deepEqual(scheduled, []);
  local.readonly = false;
  local.disabled = true;
  actions.clear();
  assert.deepEqual(scheduled, []);
  local.disabled = false;
  state.checkable = true;
  state.multiple = true;
  local.keys = ['root', 0, 'leaf'];
  actions.remove('root');
  assert.deepEqual(local.keys, []);
  local.retain = true;
  actions.blur();
  assert.equal(local.input, 'query');
});

test('numeric key zero removal preserves linked checks for the remaining sibling', () => {
  const { actions, local, state, scheduled } = controllerFixture();
  state.checkable = true;
  state.multiple = true;
  local.keys = ['root', 0, 'leaf'];
  actions.remove(0);
  assert.deepEqual(local.keys, ['leaf']);
  assert.equal(scheduled.length, 1);
});
