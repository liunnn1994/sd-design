import { getVisibleTreeNodes } from '@sdata/web-core/tree/query';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { TreeNodeView } from '../../src/tree/node.js';
import { useTreeData } from '../../src/tree/use-tree-data.js';
import { useTreeState } from '../../src/tree/use-tree-state.js';
import '../../styles/tree.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [events, setEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [switcher, setSwitcher] = useState(true);
  const [mounted, setMounted] = useState(true);
  const data = useTreeData({
    selectable: true,
    checkable: true,
    showLine: query.has('line'),
    blockNode: true,
    treeData: [
      {
        key: 0,
        title: 'Root',
        icon: query.has('local') ? () => <i>Local icon</i> : undefined,
        switcherIcon: query.has('local') ? () => <i>Local switcher</i> : undefined,
        loadingIcon: query.has('local') ? () => <i>Local loading</i> : undefined,
        dragIcon: query.has('local') ? () => <i>Local drag</i> : undefined,
        draggable: query.has('local'),
        children: [
          { key: 'one', title: 'First leaf' },
          { key: 'locked', title: 'Disabled leaf', disabled: true },
          { key: 'no-check', title: 'No checkbox', disableCheckbox: true },
        ],
      },
    ],
  });
  const state = useTreeState(
    {
      defaultCheckedKeys: [],
      checkedKeys: undefined,
      halfCheckedKeys: undefined,
      defaultExpandAll: query.has('open'),
    },
    data,
  );
  const nodes = getVisibleTreeNodes({
    nodes: data.flattenTreeData,
    expandedKeys: state.expandedKeys,
    expandingKeys: state.expandingKeys,
  });
  const context = {
    ...state,
    treeProps: { actionOnNodeClick: query.has('action') ? ('expand' as const) : undefined },
    loadingKeys: loading ? [0] : [],
    onCheck: state.foundation.check,
    onSelect: state.foundation.select,
    onExpand: state.foundation.expand,
    onNodeEvent: (name: string, key: string | number, event: Event) => {
      if (['click', 'contextmenu', 'keydown'].includes(name))
        setEvents((old) => [...old, `${name}:${key}:${event instanceof Event}`]);
    },
    onNodeKeydown: (key: string | number, event: KeyboardEvent) =>
      setEvents((old) => [...old, `key:${key}:${event.key}`]),
  };
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Toggle nodes</button>
      <button onClick={() => setLoading(!loading)}>Toggle loading</button>
      <button onClick={() => setSwitcher(!switcher)}>Toggle switcher</button>
      <div className="sd-tree" role="tree" style={{ width: 260 }}>
        {mounted &&
          nodes.map((node) => (
            <TreeNodeView
              key={node.key}
              node={node}
              context={context}
              gestures={{
                longPress: () => setEvents((old) => [...old, `long:${node.key}`]),
                swipeStart: (_event, direction) =>
                  setEvents((old) => [...old, `start:${direction}`]),
                swipe: (_event, direction) => setEvents((old) => [...old, `swipe:${direction}`]),
                swipeEnd: (_event, direction) => setEvents((old) => [...old, `end:${direction}`]),
              }}
              activeKey={0}
              switcher={switcher}
              ellipsis={query.has('ellipsis') ? true : undefined}
              renderTitle={
                query.has('custom')
                  ? (raw, status) => (
                      <b>
                        {raw.title}:{String(status.selected)}
                      </b>
                    )
                  : undefined
              }
              renderIcon={query.has('custom') ? () => <i data-testid="icon">Icon</i> : undefined}
              renderSwitcherIcon={
                query.has('custom') ? () => <i data-testid="switcher">Switch</i> : undefined
              }
              renderLoadingIcon={
                query.has('custom') ? () => <i data-testid="loading">Loading</i> : undefined
              }
              renderExtra={
                query.has('custom') ? (raw) => <small>Extra:{raw.key}</small> : undefined
              }
            />
          ))}
      </div>
      <output data-testid="selected">{JSON.stringify(state.selectedKeys)}</output>
      <output data-testid="checked">{JSON.stringify(state.checkedKeys)}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
