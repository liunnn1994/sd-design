import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { Filters, Sorter, TableColumnData, TableData } from '../../src/table/types.js';

import { TableColumn, getChildColumns } from '../../src/table/column.js';
import { useTableData } from '../../src/table/use-data.js';

const data: TableData[] = [
  {
    key: 'parent',
    age: 30,
    group: 'a',
    children: [{ key: 'child', age: 5, group: 'a', disabled: true, isLeaf: true }],
  },
  { key: 'lazy', age: 10, group: 'b', isLeaf: false },
  { key: 'last', age: 20, group: 'a', isLeaf: true },
];
function Fixture() {
  const [filters, setFilters] = useState<Filters>({});
  const [sorter, setSorter] = useState<Sorter>();
  const [page, setPage] = useState(1);
  const [hideEmpty, setHideEmpty] = useState(false);
  const [callbackKey, setCallbackKey] = useState(false);
  const [nested, setNested] = useState(true);
  const [title, setTitle] = useState('Initial');
  const columns = new Map<string, TableColumnData>([
    ['age', { dataIndex: 'age', sortable: { sortDirections: ['ascend', 'descend'] } }],
    [
      'group',
      {
        dataIndex: 'group',
        filterable: { filter: (values, row) => values.includes(String(row.group)) },
      },
    ],
  ]);
  const model = useTableData({
    data,
    columns,
    filters,
    sorter,
    page,
    pageSize: 2,
    pagination: true,
    loadMore: true,
    hideExpandButtonOnEmpty: hideEmpty,
    rowKey: callbackKey ? (row) => `key:${row.key}` : 'key',
  });
  const row = model.getSortedData().find((item) => item.raw.key === 'lazy')!;
  const declared = getChildColumns(
    <>
      <TableColumn title={title} dataIndex="age" />
      <>
        {nested && (
          <TableColumn title="Group">
            <TableColumn dataIndex="group" title="Child" />
          </TableColumn>
        )}
      </>
    </>,
  );
  return (
    <>
      <output data-testid="rows">
        {JSON.stringify(
          model.rows.map((item) => ({
            key: item.key,
            subtree: item.hasSubtree,
            children: item.children?.map((child) => child.key),
          })),
        )}
      </output>
      <output data-testid="keys">
        {JSON.stringify({
          all: model.allRowKeys,
          current: model.currentAllRowKeys,
          enabled: model.currentAllEnabledRowKeys,
        })}
      </output>
      <output data-testid="raw">{JSON.stringify(model.rawRows)}</output>
      <output data-testid="columns">{JSON.stringify(declared)}</output>
      <button onClick={() => setFilters({ group: ['a'] })}>Filter</button>
      <button onClick={() => setSorter({ field: 'age', direction: 'ascend' })}>Sort</button>
      <button onClick={() => setPage(2)}>Page two</button>
      <button onClick={() => model.addLazyLoadData([{ key: 'loaded', isLeaf: true }], row)}>
        Load children
      </button>
      <button onClick={() => model.addLazyLoadData([], row)}>Empty children</button>
      <button onClick={() => setHideEmpty(true)}>Hide empty</button>
      <button onClick={() => setCallbackKey(true)}>Callback key</button>
      <button
        onClick={() => {
          setNested(!nested);
          setTitle('Changed');
        }}
      >
        Change declarations
      </button>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
