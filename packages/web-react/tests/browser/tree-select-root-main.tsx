import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { TreeSelect, type TreeSelectInstance } from '../../src/tree-select/tree-select.js';
import '../../styles/tree-select.scss';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(query.has('loading'));
  const ref = useRef<TreeSelectInstance>(null);
  return (
    <>
      <button onClick={() => setLoading(false)}>Finish loading</button>
      <button onClick={() => ref.current?.focus()}>Focus</button>
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
        filterable={query.has('aliases')}
        clearable={query.has('aliases')}
        allowClear={query.has('aliases') ? undefined : true}
        multiple={query.has('multiple')}
        treeCheckable={query.has('aliases') ? undefined : query.has('check')}
        checkable={query.has('aliases')}
        selectable={query.has('leaf') ? 'leaf' : true}
        virtualListProps={query.has('virtual') ? { height: 160 } : undefined}
        virtualScroll={!query.has('novirtual')}
        readonly={query.has('readonly')}
        value={query.has('controlled') ? 0 : undefined}
        data={
          query.has('empty')
            ? []
            : [
                {
                  key: 0,
                  title: 'Root',
                  children: [
                    { key: 'one', title: 'One' },
                    { key: 'two', title: 'Two' },
                  ],
                },
              ]
        }
        onValueChange={(next) => setValue(JSON.stringify(next))}
      />
      <output>{value}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
