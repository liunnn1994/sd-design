import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TreeDragAdapter, TreeDragState } from '../src/tree/drag.ts';
import type { TreeQueryNode } from '../src/tree/query.ts';
import type { TreeNodeKey } from '../src/tree/types.ts';

import { createTreeDragFoundation } from '../dist/tree/drag.js';

type Node = TreeQueryNode<{ id: TreeNodeKey }>;
function setup() {
  const node = (key: TreeNodeKey, pathParentKeys: TreeNodeKey[] = []): Node => ({
    key,
    treeNodeData: { id: key },
    pathParentKeys,
  });
  const source = node(0),
    target = node(''),
    child = node('child', [0]);
  const nodes = new Map([source, target, child].map((item) => [item.key, item]));
  const state: TreeDragState = {
    sourceKey: undefined,
    targetKey: undefined,
    position: 0,
    allowed: false,
  };
  const dragNode: { value: Node | undefined } = { value: undefined };
  const calls: Array<[string, unknown, unknown]> = [];
  const adapter: TreeDragAdapter<Node['treeNodeData'], Node, object> = {
    state,
    dragNode,
    getNodes: () => nodes,
    allowDrop: { value: undefined },
    events: {
      start: (event, node) => calls.push(['start', event, node]),
      end: (event, node) => calls.push(['end', event, node]),
      over: (event, node) => calls.push(['over', event, node]),
      leave: (event, node) => calls.push(['leave', event, node]),
      drop: (data) => calls.push(['drop', data.e, data]),
    },
  };
  return {
    source,
    target,
    child,
    nodes,
    state,
    dragNode,
    calls,
    adapter,
    foundation: createTreeDragFoundation(adapter),
  };
}

test('tree drag construction reads no node map or DOM and missing geometry stays lazy', () => {
  const s = setup();
  s.adapter.getNodes = () => {
    throw Error('early map read');
  };
  const foundation = createTreeDragFoundation(s.adapter);
  foundation.start(undefined, {});
  foundation.over(undefined, {}, () => {
    throw Error('early geometry');
  });
  foundation.over(s.target, {}, () => {
    throw Error('no active source');
  });
  assert.equal(s.state.targetKey, '');
  assert.equal(s.state.allowed, false);
});

test('tree drag preserves exact quarter bands and boundary/zero-height behavior', () => {
  const s = setup(),
    event = {};
  s.foundation.start(s.source, event);
  for (const [offset, height, expected] of [
    [24, 100, -1],
    [25, 100, 0],
    [75, 100, 0],
    [76, 100, 1],
    [0, 0, 0],
    [1, 0, 1],
    [-1, 0, -1],
  ]) {
    s.foundation.over(s.target, event, () => ({ offset: offset!, height: height! }));
    assert.equal(s.state.position, expected);
    assert.equal(s.state.allowed, true);
  }
});

test('tree drag retains callback cell receiver, exact data, live changes and truthiness', () => {
  const s = setup();
  const cell = {
    value(options: { dropNode: Node['treeNodeData']; dropPosition: -1 | 0 | 1 }) {
      assert.equal(this, cell);
      assert.equal(options.dropNode, s.target.treeNodeData);
      assert.equal(options.dropPosition, -1);
      return false;
    },
  };
  s.adapter.allowDrop = cell;
  assert.equal(s.foundation.allowDrop('', -1), false);
  cell.value = () => true;
  assert.equal(s.foundation.allowDrop('', 0), true);
  assert.equal(s.foundation.allowDrop('missing', 0), true);
});

test('tree drag rejects self/descendants without consulting allowDrop but still notifies over', () => {
  const s = setup(),
    event = {};
  s.adapter.allowDrop = {
    value: () => {
      throw Error('invalid target must short circuit');
    },
  };
  s.foundation.start(s.source, event);
  for (const node of [s.source, s.child]) {
    s.foundation.over(node, event, () => ({ offset: 50, height: 100 }));
    assert.equal(s.state.allowed, false);
    assert.deepEqual(s.calls.at(-1), ['over', event, node.treeNodeData]);
    s.foundation.onDrop(node.key, 0, event);
  }
  assert.equal(
    s.calls.some((call) => call[0] === 'drop'),
    false,
  );
});

test('tree drag leaves the previous target before changing it and preserves position on missing target', () => {
  const s = setup(),
    event = {};
  s.foundation.start(s.source, event);
  s.foundation.over(s.target, event, () => ({ offset: 1, height: 100 }));
  s.adapter.events.leave = (e, node) => {
    assert.equal(e, event);
    assert.equal(node, s.target.treeNodeData);
    assert.equal(s.state.targetKey, '');
    assert.equal(s.state.allowed, true);
  };
  s.foundation.over(undefined, event, undefined);
  assert.equal(s.state.targetKey, undefined);
  assert.equal(s.state.allowed, false);
  assert.equal(s.state.position, -1);
});

test('tree drag commits source before start and orders drop, leave, cleared drag-node end, then state reset', () => {
  const s = setup(),
    event = {};
  s.adapter.events.start = () => {
    assert.equal(s.state.sourceKey, 0);
    assert.equal(s.dragNode.value, s.source);
  };
  s.foundation.start(s.source, event);
  s.foundation.over(s.target, event, () => ({ offset: 90, height: 100 }));
  s.calls.length = 0;
  s.adapter.events.end = (e, node) => {
    assert.equal(s.dragNode.value, undefined);
    assert.equal(s.state.sourceKey, 0);
    s.calls.push(['end', e, node]);
  };
  s.foundation.end(event, false);
  assert.deepEqual(
    s.calls.map((call) => call[0]),
    ['drop', 'leave', 'end'],
  );
  assert.deepEqual(s.calls[0]![2], {
    e: event,
    dragNode: s.source.treeNodeData,
    dropNode: s.target.treeNodeData,
    dropPosition: 1,
  });
  assert.deepEqual(s.state, {
    sourceKey: undefined,
    targetKey: undefined,
    position: 0,
    allowed: false,
  });
});

test('tree drag cancellation and removed nodes still release state without fabricated notifications', () => {
  const s = setup(),
    event = {};
  s.foundation.start(s.source, event);
  s.foundation.over(s.target, event, () => ({ offset: 50, height: 100 }));
  s.calls.length = 0;
  s.foundation.end(event, true);
  assert.deepEqual(
    s.calls.map((call) => call[0]),
    ['leave', 'end'],
  );
  s.foundation.start(s.source, event);
  s.foundation.over(s.target, event, () => ({ offset: 50, height: 100 }));
  s.nodes.clear();
  s.calls.length = 0;
  s.foundation.end(event, false);
  assert.deepEqual(s.calls, []);
  assert.equal(s.dragNode.value, undefined);
  assert.equal(s.state.sourceKey, undefined);
});

test('tree drag propagates notification failures without changing legacy cleanup order', () => {
  const s = setup(),
    event = {},
    failure = Error('drop failed');
  s.foundation.start(s.source, event);
  s.foundation.over(s.target, event, () => ({ offset: 50, height: 100 }));
  s.adapter.events.drop = () => {
    throw failure;
  };
  assert.throws(
    () => s.foundation.end(event, false),
    (error) => error === failure,
  );
  assert.equal(s.state.allowed, true);
  assert.equal(s.dragNode.value, s.source);
});
