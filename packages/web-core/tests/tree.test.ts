import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CheckNode } from '../src/tree/types.ts';

import { getCheckedStateByCheck, getCheckedStateByInitKeys } from '../dist/tree/check.js';

function fixture() {
  const root: CheckNode = { key: 'parent', checkable: true };
  const first: CheckNode = { key: 1, checkable: true, parent: root };
  const second: CheckNode = { key: 2, checkable: true, parent: root };
  const disabled: CheckNode = { key: 'disabled', checkable: true, disabled: true, parent: root };
  const nested: CheckNode = { key: 'nested', checkable: true, parent: disabled };
  root.children = [first, second, disabled];
  disabled.children = [nested];
  return {
    root,
    first,
    second,
    key2TreeNode: new Map([root, first, second, disabled, nested].map((node) => [node.key, node])),
  };
}

test('linked checks compute parent half state, full state, and unchecked state', () => {
  const { first, second } = fixture();
  const [checked, half] = getCheckedStateByCheck({
    node: first,
    checked: true,
    checkedKeys: [],
    indeterminateKeys: [],
  });
  assert.deepEqual(checked, [1]);
  assert.deepEqual(half, ['parent']);
  const [full, noHalf] = getCheckedStateByCheck({
    node: second,
    checked: true,
    checkedKeys: checked,
    indeterminateKeys: half,
  });
  assert.deepEqual(new Set(full), new Set([1, 2, 'parent']));
  assert.deepEqual(noHalf, []);
  const [remaining, partial] = getCheckedStateByCheck({
    node: first,
    checked: false,
    checkedKeys: full,
    indeterminateKeys: [],
  });
  assert.deepEqual(remaining, [2]);
  assert.deepEqual(partial, ['parent']);
});

test('disabled subtrees stop cascades, and strict mode isolates the selected node', () => {
  const { root } = fixture();
  const [checked] = getCheckedStateByCheck({
    node: root,
    checked: true,
    checkedKeys: [],
    indeterminateKeys: [],
  });
  assert.deepEqual(new Set(checked), new Set(['parent', 1, 2]));
  const [strict] = getCheckedStateByCheck({
    node: root,
    checked: true,
    checkedKeys: [],
    indeterminateKeys: [],
    checkStrictly: true,
  });
  assert.deepEqual(strict, ['parent']);
});

test('initial keys preserve numeric identity and derive linked parents', () => {
  const { key2TreeNode } = fixture();
  const [checked, half] = getCheckedStateByInitKeys({
    initCheckedKeys: [1, 2, 'missing'],
    key2TreeNode,
  });
  assert.deepEqual(new Set(checked), new Set([1, 2, 'parent']));
  assert.deepEqual(half, []);
});
