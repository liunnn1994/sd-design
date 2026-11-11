import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createPanelGroupStore } from '../src/panel-group/context.ts';

test('PanelGroup mirrors engine fields without notifying controller synchronization listeners', () => {
  const store = createPanelGroupStore('horizontal');
  let renders = 0;
  let synchronizations = 0;
  const stop = store.subscribe(() => renders++);
  store.group.subscribe(() => synchronizations++);
  store.group.fill.size = 120;
  store.group.fill.anchor = 'flex-end';
  assert.equal(renders, 2);
  assert.equal(synchronizations, 0);
  const snapshot = store.getSnapshot();
  store.group.fill.size = 120;
  assert.equal(store.getSnapshot(), snapshot);
  store.group.notify();
  assert.equal(renders, 3);
  assert.equal(synchronizations, 1);
  stop();
  store.group.fill.size = '100%';
  assert.equal(renders, 3);
});

test('PanelGroup broadcasts once per mutation to every subscriber and isolates nested groups', () => {
  const outer = createPanelGroupStore('horizontal');
  const inner = createPanelGroupStore('vertical');
  let first = 0;
  let second = 0;
  const stop = outer.subscribe(() => first++);
  outer.subscribe(() => second++);
  outer.group.notify();
  assert.deepEqual([first, second], [1, 1]);
  assert.equal(inner.getSnapshot(), 0);
  assert.equal(inner.group.axes.direction, 'column');
  stop();
  outer.group.axes.direction = 'column';
  assert.deepEqual([first, second], [1, 2]);
  assert.equal(inner.getSnapshot(), 0);
});
