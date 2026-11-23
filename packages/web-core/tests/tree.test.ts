import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CheckNode, TreeModelNode, TreeData } from '../src/tree/types.ts';

import { getCheckedStateByCheck, getCheckedStateByInitKeys } from '../dist/tree/check.js';
import { generateTreeData } from '../dist/tree/data.js';
import { getFlattenTreeData, getKey2TreeNode } from '../dist/tree/query.js';

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

const treeOptions = {
  checkable: true,
  selectable: true,
  draggable: false,
  blockNode: false,
  showLine: false,
  loadMore: false,
};

test('tree data preserves typed keys, inherits flags and honors overrides in either direction', () => {
  const data = [
    { key: 0, title: 'Numeric' },
    { key: '0', title: 'String' },
    { key: 1, checkable: false, selectable: false, draggable: true },
    { key: 2, checkable: true, selectable: true, draggable: false },
  ];
  const normal = getKey2TreeNode(getFlattenTreeData(generateTreeData(data, treeOptions)));
  const reversed = getKey2TreeNode(
    getFlattenTreeData(
      generateTreeData(data, {
        ...treeOptions,
        checkable: false,
        selectable: false,
        draggable: true,
      }),
    ),
  );
  const flags = ({ checkable, selectable, draggable }: TreeModelNode<TreeData>) => [
    checkable,
    selectable,
    draggable,
  ];
  assert.equal(normal.get(0)!.title, 'Numeric');
  assert.equal(normal.get('0')!.title, 'String');
  assert.deepEqual(flags(normal.get(0)!), [true, true, false]);
  assert.deepEqual(flags(normal.get(1)!), [false, false, true]);
  assert.deepEqual(flags(reversed.get(0)!), [false, false, true]);
  assert.deepEqual(flags(reversed.get(2)!), [true, true, false]);
});

test('tree checking respects checkbox-disabled branches, strict mode and leaf-only initialization', () => {
  const nodes = getKey2TreeNode(
    getFlattenTreeData(
      generateTreeData(
        [
          {
            key: 'root',
            children: [
              { key: 'leaf' },
              { key: 'blocked', disableCheckbox: true, children: [{ key: 'nested' }] },
            ],
          },
        ],
        treeOptions,
      ),
    ),
  );
  const root = nodes.get('root')!;
  const initial = (
    keys: string[],
    options?: { checkStrictly?: boolean; onlyCheckLeaf?: boolean },
  ) => getCheckedStateByInitKeys({ initCheckedKeys: keys, key2TreeNode: nodes, ...options });
  const toggle = (
    node: typeof root,
    checked: boolean,
    checkedKeys: string[],
    checkStrictly = false,
  ) => getCheckedStateByCheck({ node, checked, checkedKeys, indeterminateKeys: [], checkStrictly });

  const [checked] = toggle(root, true, []);
  assert.deepEqual(new Set(checked), new Set(['root', 'leaf']));
  assert.deepEqual(toggle(root, false, ['root', 'leaf']), [[], []]);
  assert.deepEqual(toggle(root, true, [], true), [['root'], []]);
  assert.deepEqual(toggle(root, false, ['root', 'leaf'], true), [['leaf'], []]);
  assert.deepEqual(toggle(nodes.get('nested')!, true, []), [['nested'], []]);
  assert.deepEqual(initial(['nested']), [['nested'], []]);
  assert.deepEqual(initial(['root'], { checkStrictly: true }), [['root'], []]);
  assert.deepEqual(initial(['root'], { onlyCheckLeaf: true }), [[], []]);
  const [leaves] = initial(['root', 'leaf'], { onlyCheckLeaf: true });
  assert.deepEqual(new Set(leaves), new Set(['root', 'leaf']));
  for (const keys of [['root'], ['leaf', 'root']]) {
    const [value] = initial(keys);
    assert.deepEqual(value.toSorted(), ['leaf', 'root']);
  }
});
