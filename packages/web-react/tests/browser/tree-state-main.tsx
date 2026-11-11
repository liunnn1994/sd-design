import type { TreeNodeKey } from '@sdata/web-core/tree/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTreeData } from '../../src/tree/use-tree-data.js';
import { useTreeState } from '../../src/tree/use-tree-state.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [controlled, setControlled] = useState(query.has('controlled'));
  const [external, setExternal] = useState<TreeNodeKey[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [calls, setCalls] = useState(0);
  const pending = useRef<{ resolve(): void; reject(error: Error): void }>(null);
  const data = useTreeData({
    selectable: true,
    checkable: true,
    loadMore: true,
    treeData: useRef([
      {
        key: 0,
        title: 'Root',
        children: [
          { key: 'one', title: 'One' },
          { key: 'two', title: 'Two' },
          { key: 'locked', disabled: true },
        ],
      },
      { key: 'lazy', isLeaf: false },
    ]).current,
  });
  const record = (message: string) => setEvents((old) => [...old, message]);
  const state = useTreeState(
    {
      defaultCheckedKeys: [],
      checkedKeys: controlled ? external : undefined,
      halfCheckedKeys: undefined,
      defaultSelectedKeys: ['one'],
      selectedKeys: controlled ? external : undefined,
      expandedKeys: controlled ? external : undefined,
      defaultExpandSelected: query.has('default'),
      multiple: !query.has('single'),
      animateExpand: query.has('animate'),
      checkedStrategy: query.has('parent') ? 'parent' : 'all',
      loadMore: () => {
        setCalls((value) => value + 1);
        return new Promise<void>((resolve, reject) => {
          pending.current = { resolve, reject };
        });
      },
      onLoadError: (error) => record(`error:${(error as Error).message}`),
      events: {
        updateSelected: (keys) => record(`selected:${keys}`),
        select: (keys, detail) =>
          record(
            `select:${keys}:${detail.node?.key ?? '-'}:${detail.selectedNodes.map((node) => node.key)}`,
          ),
        updateChecked: (keys) => record(`checked:${keys}`),
        updateHalfChecked: (keys) => record(`half:${keys}`),
        check: (keys) => record(`check:${keys}`),
        expand: (keys) => record(`expand:${keys}`),
        updateExpanded: (keys) => record(`expanded:${keys}`),
      },
    },
    data,
  );
  return (
    <>
      <button
        onClick={() => {
          state.foundation.selectNode('two');
          state.foundation.selectNode('locked');
        }}
      >
        Select two
      </button>
      <button
        onClick={() => {
          state.foundation.toggleCheck('one');
          state.foundation.toggleCheck('two');
        }}
      >
        Check siblings
      </button>
      <button onClick={() => state.foundation.selectAll()}>Select all</button>
      <button onClick={() => state.foundation.expand(true, 0)}>Expand root</button>
      <button onClick={() => state.foundation.expand(false, 0)}>Collapse root</button>
      <button onClick={() => state.foundation.endExpand(0)}>End animation</button>
      <button onClick={() => state.foundation.expandAll()}>Expand all</button>
      <button
        onClick={() => {
          void state.foundation.loadMore('lazy');
          void state.foundation.loadMore('lazy');
        }}
      >
        Load twice
      </button>
      <button onClick={() => pending.current?.resolve()}>Resolve</button>
      <button onClick={() => pending.current?.reject(new Error('offline'))}>Reject</button>
      <button onClick={() => setExternal(['two'])}>External two</button>
      <button onClick={() => setControlled(false)}>Release</button>
      <button onClick={() => setEvents([])}>Clear events</button>
      {(
        [
          'selectedKeys',
          'checkedKeys',
          'indeterminateKeys',
          'expandedKeys',
          'expandingKeys',
          'loadingKeys',
        ] as const
      ).map((key) => (
        <output key={key} data-testid={key}>
          {JSON.stringify(state[key])}
        </output>
      ))}
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="calls">{calls}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
