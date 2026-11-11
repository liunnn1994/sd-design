import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTableExpand } from '../../src/table/use-expand.js';
import { useTableRowSelection } from '../../src/table/use-row-selection.js';

const row = {
  key: 'parent',
  raw: { label: 'Parent' },
  children: [
    { key: 1, raw: { label: 'One' }, isLeaf: true },
    { key: 2, raw: { label: 'Two' }, isLeaf: true },
  ],
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [controlled, setControlled] = useState(query.has('controlled'));
  const [radio, setRadio] = useState(false);
  const [all, setAll] = useState<(string | number)[]>(['parent', 1, 2]);
  const [events, setEvents] = useState<string[]>([]);
  const record = (event: string) => setEvents((old) => [...old, event]);
  const selection = useTableRowSelection({
    selectedKeys: controlled ? [] : undefined,
    defaultSelectedKeys: ['off-page', 2],
    rowSelection: {
      type: radio ? 'radio' : 'checkbox',
      selectedRowKeys: controlled ? [2] : undefined,
    },
    currentAllRowKeys: all,
    currentAllEnabledRowKeys: [1],
    onSelectAll: (checked) => record(`all:${checked}`),
    onSelect: (_, key, raw: { label: string }) => record(`select:${key}:${raw.label}`),
    onSelectionChange: () => record('selection'),
    onSelectedKeysChange: () => record('selectedKeys'),
  });
  const expansion = useTableExpand({
    expandedKeys: controlled ? [] : undefined,
    defaultExpandAllRows: query.has('all'),
    expandable: { expandedRowKeys: controlled ? ['parent'] : undefined },
    allRowKeys: all,
    onExpand: (key, raw: { label: string }) => record(`expand:${key}:${raw.label}`),
    onExpandedChange: () => record('expanded'),
    onExpandedKeysChange: () => record('expandedKeys'),
  });
  return (
    <>
      <output data-testid="selected">{JSON.stringify(selection.selectedRowKeys)}</output>
      <output data-testid="current">{JSON.stringify(selection.currentSelectedRowKeys)}</output>
      <output data-testid="expanded">{JSON.stringify(expansion.expandedRowKeys)}</output>
      <output data-testid="events">{events.join(',')}</output>
      <button onClick={() => selection.handleSelectAll(true)}>Select enabled</button>
      <button onClick={() => selection.handleSelectAll(false)}>Deselect enabled</button>
      <button onClick={() => selection.handleSelectAllLeafs(row, true)}>Select leafs</button>
      <button onClick={() => selection.handleSelect(true, row.children[0]!)}>Select one</button>
      <button
        onClick={() => {
          selection.select(1);
          selection.select('parent');
        }}
      >
        Select batch
      </button>
      <button onClick={selection.clearSelected}>Clear selection</button>
      <button onClick={() => setRadio(!radio)}>Radio</button>
      <button onClick={() => setControlled(!controlled)}>Toggle controlled</button>
      <button onClick={() => expansion.handleExpand('parent', row.raw)}>Expand parent</button>
      <button
        onClick={() => {
          expansion.expand(1);
          expansion.expand(2);
        }}
      >
        Expand batch
      </button>
      <button onClick={() => expansion.expandAll()}>Expand all</button>
      <button onClick={() => expansion.expandAll(false)}>Collapse all</button>
      <button onClick={() => setAll([1, 3])}>Change rows</button>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
