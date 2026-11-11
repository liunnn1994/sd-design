import { getVisibleTreeNodes } from '@sdata/web-core/tree/query';
import { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { TreeNodeView } from '../../src/tree/node.js';
import { useTreeKeyboard } from '../../src/tree/use-keyboard.js';
import { useTreeData } from '../../src/tree/use-tree-data.js';
import { useTreeState } from '../../src/tree/use-tree-state.js';
import '../../styles/tree.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const root = useRef<HTMLDivElement>(null);
  const [removed, setRemoved] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [scrolled, setScrolled] = useState('');
  const [loads, setLoads] = useState(0);
  // Loading counters must not replace raw nodes and invalidate their pending requests.
  const treeData = useMemo(
    () => [
      {
        key: 0,
        title: 'Number root',
        children: [
          { key: '0', title: 'String child' },
          { key: 'locked', title: 'Locked', disabled: true },
        ],
      },
      ...(!removed ? [{ key: 'quote"[]', title: 'Escaped key', isLeaf: true }] : []),
      { key: 'lazy', title: 'Lazy', isLeaf: false },
    ],
    [removed],
  );
  const data = useTreeData({
    selectable: true,
    checkable: query.has('check'),
    loadMore: true,
    treeData,
  });
  const state = useTreeState(
    {
      defaultCheckedKeys: [],
      checkedKeys: undefined,
      halfCheckedKeys: undefined,
      defaultSelectedKeys: query.has('selected') ? ['quote"[]'] : [],
      loadMore: async () => {
        setLoads((value) => value + 1);
      },
    },
    data,
  );
  const visibleNodes = getVisibleTreeNodes({
    nodes: data.flattenTreeData,
    expandedKeys: state.expandedKeys,
    expandingKeys: state.expandingKeys,
  });
  const keyboard = useTreeKeyboard({
    root,
    state,
    visibleNodes,
    canLoadMore: true,
    scrollToKey: (key) => setScrolled(`${typeof key}:${key}`),
  });
  return (
    <>
      <button onClick={() => keyboard.focusNodeKey('quote"[]')}>Focus escaped</button>
      <button onClick={() => setRemoved(true)}>Remove escaped</button>
      <button onClick={() => setMounted(!mounted)}>Toggle DOM</button>
      <div className="sd-tree" role="tree" ref={root}>
        {mounted &&
          visibleNodes.map((node) => (
            <TreeNodeView
              key={`${typeof node.key}:${node.key}`}
              node={node}
              activeKey={keyboard.activeKey}
              context={{
                ...state,
                onCheck: state.foundation.check,
                onSelect: state.foundation.select,
                onExpand: state.foundation.expand,
                onLoadMore: state.foundation.loadMore,
                onNodeKeydown: keyboard.onNodeKeydown,
                onNodeEvent: (name, _key, event) => {
                  if (query.has('prevent') && name === 'keydown') event.preventDefault();
                },
              }}
            />
          ))}
      </div>
      <output data-testid="active">
        {typeof keyboard.activeKey}:{keyboard.activeKey}
      </output>
      <output data-testid="selected">{JSON.stringify(state.selectedKeys)}</output>
      <output data-testid="checked">{JSON.stringify(state.checkedKeys)}</output>
      <output data-testid="scroll">{scrolled}</output>
      <output data-testid="loads">{loads}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
