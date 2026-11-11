import type { TreeData } from '@sdata/web-core/tree/types';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTreeData } from '../../src/tree/use-tree-data.js';

const shared: TreeData = { title: 'Shared' };
const root: TreeData = {
  key: 0,
  title: 'Root',
  children: [{ key: 'leaf', title: 'Leaf' }, shared],
};
const mapped: TreeData[] = [
  { id: 0, name: 'Mapped', nodes: [{ id: 'child', name: 'Child', locked: true }] },
];
function Fixture() {
  const [nodes, setNodes] = useState<TreeData[]>([root, shared]);
  const [mapping, setMapping] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [lazy, setLazy] = useState(false);
  const [, rerender] = useState(0);
  const data = useTreeData({
    treeData: mapping ? mapped : nodes,
    fieldNames: mapping
      ? { key: 'id', title: 'name', children: 'nodes', disabled: 'locked' }
      : undefined,
    selectable: (_, info) => enabled && info.isLeaf,
    checkable: (_, info) => enabled && info.level > 0,
    loadMore: lazy,
    blockNode: enabled,
    showLine: enabled,
    draggable: enabled,
  });
  return (
    <>
      <button onClick={() => rerender((value) => value + 1)}>Rerender</button>
      <button onClick={() => setNodes([root])}>Remove sibling</button>
      <button onClick={() => setNodes([{ key: 'replacement', title: 'Replacement' }])}>
        Replace
      </button>
      <button onClick={() => setNodes([])}>Empty</button>
      <button onClick={() => setMapping(true)}>Map fields</button>
      <button onClick={() => setEnabled(true)}>Enable</button>
      <button onClick={() => setLazy(true)}>Lazy</button>
      <button
        onClick={() => {
          shared.title = 'Changed';
          rerender((value) => value + 1);
        }}
      >
        Mutate title
      </button>
      <output data-testid="nodes">
        {JSON.stringify(
          data.flattenTreeData.map((node) => ({
            key: node.key,
            title: node.title,
            parent: node.parentKey,
            parents: node.pathParentKeys,
            level: node.level,
            leaf: node.isLeaf,
            selectable: node.selectable,
            checkable: node.checkable,
            disabled: node.disabled,
            block: node.blockNode,
            line: node.showLine,
            draggable: node.draggable,
            lineless: node.lineless,
          })),
        )}
      </output>
      <output data-testid="identity">
        {String(data.flattenTreeData.every((node) => data.key2TreeNode.get(node.key) === node))}
      </output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
