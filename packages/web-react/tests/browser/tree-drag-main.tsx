import { StrictMode, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { TreeNodeView } from '../../src/tree/node.js';
import { useTreeDrag } from '../../src/tree/use-drag.js';
import { useTreeData } from '../../src/tree/use-tree-data.js';
import '../../styles/tree.scss';

function Fixture() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(true);
  useLayoutEffect(() => {
    const unmount = () => setMounted(false);
    window.addEventListener('tree-unmount', unmount);
    return () => window.removeEventListener('tree-unmount', unmount);
  }, []);
  const [allowed, setAllowed] = useState(true);
  const [draggable, setDraggable] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const data = useTreeData({
    draggable,
    treeData: [
      { key: 0, title: 'Root', children: [{ key: 'child', title: 'Child' }] },
      { key: 'target', title: 'Target' },
      { key: 'fixed', title: 'Fixed', draggable: false },
    ],
  });
  const record = (name: string) => setEvents((old) => [...old, name]);
  const dragState = useTreeDrag({
    root,
    nodes: data.key2TreeNode,
    allowDrop: () => allowed,
    events: {
      start: (event, node) => record(`start:${node.key}:${event instanceof DragEvent}`),
      leave: (_event, node) => record(`leave:${node.key}`),
      end: (_event, node) => record(`end:${node.key}`),
      drop: ({ dragNode, dropNode, dropPosition }) =>
        record(`drop:${dragNode.key}:${dropNode.key}:${dropPosition}`),
    },
  });
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Toggle mount</button>
      <button onClick={() => setAllowed(!allowed)}>Toggle allowed</button>
      <button onClick={() => setDraggable(!draggable)}>Toggle draggable</button>
      {mounted && (
        <div ref={setRoot} className="sd-tree" style={{ width: 320 }}>
          {data.flattenTreeData.map((node) => (
            <TreeNodeView
              key={node.key}
              node={node}
              context={{ expandedKeys: [0] }}
              dragState={dragState}
            />
          ))}
        </div>
      )}
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
