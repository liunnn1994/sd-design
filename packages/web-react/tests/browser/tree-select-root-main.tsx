import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TreeNodeData } from '../../src/tree/node.js';

import { TreeSelect, type TreeSelectInstance } from '../../src/tree-select/tree-select.js';
import '../../styles/tree-select.scss';

const tree = [
  {
    key: 0,
    title: 'Root',
    children: [
      { key: 'one', title: 'One' },
      { key: 'two', title: 'Two' },
    ],
  },
];
const tallTree = Array.from({ length: 31 }, (_, index) => ({
  key: `root-${index}`,
  title: `Root ${index}`,
  children: index === 30 ? tree[0].children : undefined,
}));

function Fixture() {
  const query = new URLSearchParams(location.search);
  const lazy = query.has('lazy');
  const tall = query.has('tall');
  const liveFilter = query.has('live-filter');
  const guard = query.get('guard');
  const [value, setValue] = useState('');
  const [filterKey, setFilterKey] = useState('one');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(query.has('loading'));
  const [lazyData, setLazyData] = useState<TreeNodeData[]>([
    { key: 'branch', title: 'Branch', isLeaf: false },
  ]);
  const [loadCalls, setLoadCalls] = useState(0);
  const ref = useRef<TreeSelectInstance>(null);
  return (
    <>
      <button onClick={() => setLoading(false)}>Finish loading</button>
      <button onClick={() => ref.current?.focus()}>Focus</button>
      {liveFilter && <button onClick={() => setFilterKey('two')}>Replace filter</button>}
      {guard && <button onClick={() => setLocked(!locked)}>Toggle selection guard</button>}
      <TreeSelect
        ref={ref}
        aria-label="Team"
        style={{ width: 300 }}
        loading={loading}
        loader={<span>Loading teams</span>}
        header={query.has('custom') ? <strong>Choose team</strong> : undefined}
        footer={query.has('custom') ? <small>Team footer</small> : undefined}
        empty={<span>No teams</span>}
        showHeaderOnEmpty={query.has('showempty')}
        showFooterOnEmpty={query.has('showempty')}
        renderTrigger={
          query.has('custom')
            ? (state) => (
                <button style={{ width: 260 }} aria-expanded={state.popupVisible}>
                  {state.displayValue || 'Pick team'}
                </button>
              )
            : undefined
        }
        {...(query.has('aliases') ? {} : { allowSearch: true })}
        inputValue={liveFilter ? 'match' : undefined}
        filterTreeNode={liveFilter ? (_, node) => node.key === filterKey : undefined}
        popupVisible={liveFilter || guard ? true : undefined}
        defaultShow={query.has('default-show')}
        defaultPopupVisible={query.has('force-closed') ? false : undefined}
        filterable={query.has('aliases')}
        clearable={query.has('aliases')}
        allowClear={query.has('aliases') ? undefined : true}
        multiple={query.has('multiple') || lazy}
        treeCheckable={query.has('aliases') ? undefined : query.has('check')}
        checkable={query.has('aliases')}
        selectable={query.has('leaf') || lazy ? 'leaf' : true}
        virtualListProps={
          query.has('virtual')
            ? { height: 160, ...(tall ? { itemSize: 32, fixedSize: true } : {}) }
            : undefined
        }
        virtualScroll={!query.has('novirtual')}
        disabled={guard === 'disabled' && locked}
        readonly={query.has('readonly') || (guard === 'readonly' && locked)}
        value={query.has('controlled') ? 0 : undefined}
        data={query.has('empty') ? [] : lazy ? lazyData : tall ? tallTree : tree}
        checkStrategy={query.has('child') ? 'child' : undefined}
        treeCheckedStrategy={query.has('parent') ? 'parent' : undefined}
        treeCheckStrictly={query.has('strict')}
        treeProps={
          tall
            ? { defaultExpandedKeys: ['root-30'] }
            : query.has('controlled-expansion')
              ? { expandedKeys: [0] }
              : undefined
        }
        defaultValue={lazy ? ['branch'] : undefined}
        loadMore={
          lazy
            ? async (node) => {
                setLoadCalls((count) => count + 1);
                await new Promise<void>((resolve) => setTimeout(resolve, 120));
                node.children = [{ key: 'loaded', title: 'Loaded leaf', isLeaf: true }];
                setLazyData((data) => [...data]);
              }
            : undefined
        }
        onValueChange={(next) => setValue(JSON.stringify(next))}
      />
      <output>{value}</output>
      {lazy && <span data-testid="load-calls">{loadCalls}</span>}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
