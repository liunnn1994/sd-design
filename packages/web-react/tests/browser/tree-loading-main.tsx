import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TreeNodeData } from '../../src/tree/node.js';

import { Tree } from '../../src/tree/tree.js';
import '../../styles/tree.scss';
function Fixture() {
  const [data] = useState<TreeNodeData[]>([{ key: 'root', title: 'Root', isLeaf: false }]);
  const [, update] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  return (
    <>
      <Tree
        data={data}
        checkable
        defaultCheckedKeys={['root']}
        loadMore={async (node) => {
          await Promise.resolve();
          node.children = [{ key: 'child', title: 'Loaded child', isLeaf: true }];
          update((value) => value + 1);
        }}
        onExpand={() => setEvents((old) => [...old, 'expand'])}
        onCheck={(keys) => setEvents((old) => [...old, `check:${keys.join(',')}`])}
      />
      <output>{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
