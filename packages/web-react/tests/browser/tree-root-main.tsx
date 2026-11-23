import { StrictMode, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Tree, type TreeInstance } from '../../src/tree/tree.js';
import '../../styles/tree.scss';

const branch = [
  {
    key: 0,
    title: 'Root',
    children: [
      { key: 'one', title: 'One' },
      { key: 'two', title: 'Two' },
    ],
  },
];
const repeatedNode = { title: 'Repeated' };
const keyless = [repeatedNode, repeatedNode];
const virtualNodes = Array.from({ length: 200 }, (_, key) => ({ key, title: `Node ${key}` }));
const prependedNodes = [{ key: -1, title: 'Prepended' }, ...virtualNodes];

function Fixture() {
  const ref = useRef<TreeInstance>(null);
  useLayoutEffect(() => {
    const scroll = () => ref.current?.scrollIntoView({ index: 199, align: 'bottom' });
    window.addEventListener('tree-scroll-last', scroll);
    return () => window.removeEventListener('tree-scroll-last', scroll);
  }, []);
  const [result, setResult] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const query = new URLSearchParams(location.search);
  const [filtered, setFiltered] = useState(query.has('filter'));
  const [showLine, setShowLine] = useState(!query.has('keyless'));
  const [prepended, setPrepended] = useState(false);
  const record = (value: string) => setEvents((old) => [...old, value]);
  const virtual = location.search.includes('virtual');
  return (
    <>
      <button
        onClick={() => {
          ref.current?.checkNode('one');
          setResult(JSON.stringify(ref.current?.getCheckedNodes().map((node) => node.key)));
        }}
      >
        Check one
      </button>
      <button onClick={() => ref.current?.scrollIntoView({ index: 199, align: 'bottom' })}>
        Scroll last
      </button>
      {query.has('filter') && (
        <button onClick={() => setFiltered(false)}>Reveal descendants</button>
      )}
      {query.has('keyless') && <button onClick={() => setShowLine(true)}>Show tree lines</button>}
      {query.has('shift') && (
        <button onClick={() => setPrepended(!prepended)}>Toggle first row</button>
      )}
      <Tree
        ref={ref}
        aria-label="Files"
        checkable={!virtual}
        showLine={showLine}
        filterTreeNode={filtered ? (node) => node.key === 0 : undefined}
        animation={!query.has('noanimation')}
        draggable={query.has('drag')}
        allowDrop={() => !query.has('forbid')}
        defaultExpandAll={query.has('defaults') ? undefined : query.has('drag')}
        size={query.has('mini') ? 'mini' : undefined}
        onNodeClick={(node, event) => record(`click:${node.key}:${event instanceof Event}`)}
        onNodeKeydown={(node, event) => {
          record(`key:${node.key}`);
          if (query.has('prevent')) event.preventDefault();
        }}
        onNodeLongPress={(node) => record(`long:${node.key}`)}
        onNodeSwipeStart={(node, _event, info) => record(`start:${node.key}:${info.direction}`)}
        onNodeSwipe={(node, _event, info) => record(`swipe:${node.key}:${info.direction}`)}
        onNodeSwipeEnd={(node, _event, info) => record(`end:${node.key}:${info.direction}`)}
        onDragStart={(_event, node) => record(`drag:${node.key}`)}
        onDragEnd={(_event, node) => record(`dragEnd:${node.key}`)}
        onDrop={({ dragNode, dropNode, dropPosition }) =>
          record(`drop:${dragNode.key}:${dropNode.key}:${dropPosition}`)
        }
        data={
          virtual
            ? prepended
              ? prependedNodes
              : virtualNodes
            : query.has('keyless')
              ? keyless
              : branch
        }
        virtualListProps={
          virtual
            ? {
                height: 240,
                itemSize: 32,
                ...(query.has('shift') ? { fixedSize: true, shift: true } : {}),
              }
            : undefined
        }
        onCheckedKeysChange={(keys) => setResult(JSON.stringify(keys))}
      />
      <output>{result}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
