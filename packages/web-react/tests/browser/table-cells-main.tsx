import type { CSSProperties } from 'react';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
  Filters,
  Sorter,
  TableColumnData,
  TableData,
  TableDataWithRaw,
} from '../../src/table/types.js';

import { TableContext } from '../../src/table/context.js';
import { Tbody, Thead, Tr } from '../../src/table/row.js';
import { Td } from '../../src/table/td.js';
import { Th, type ThInstance } from '../../src/table/th.js';
import '../../styles/table.scss';

function Fixture() {
  const [sorter, setSorter] = useState<Sorter>();
  const [filters, setFilters] = useState<Filters>({});
  const [custom, setCustom] = useState(false);
  const [left, setLeft] = useState(false);
  const [headerClicks, setHeaderClicks] = useState(0);
  const [rowClicks, setRowClicks] = useState(0);
  const [loaded, setLoaded] = useState('');
  const [element, setElement] = useState('');
  const th = useRef<ThInstance>(null);
  const done = useRef<((children?: TableData[]) => void) | undefined>(undefined);
  const [raw] = useState<TableData>(() => ({
    key: 'one',
    profile: { name: 'A long name that needs to be truncated in the actual table cell' },
    age: 42,
  }));
  const record: TableDataWithRaw = { key: 'one', raw, isLeaf: false };
  const columns: TableColumnData[] = [
    {
      dataIndex: 'profile.name',
      title: 'Name',
      width: 180,
      fixed: 'left',
      isLastLeftFixed: true,
      ellipsis: true,
      tooltip: true,
      sortable: { sortDirections: ['ascend', 'descend'] },
      filterable: {
        multiple: true,
        filters: [
          { text: 'One', value: 'one' },
          { text: 'Two', value: 'two' },
        ],
        filter: () => true,
      },
      headerCellClass: { 'custom-header': custom },
      bodyCellClass: (row) => (row.key === 'one' ? 'custom-body' : ''),
      bodyCellStyle: { color: 'rgb(1, 2, 3)' },
      summaryCellClass: 'custom-summary',
      summaryCellStyle: { color: 'rgb(4, 5, 6)' },
      slots: custom ? { title: () => 'Custom title' } : undefined,
      render: custom ? (data) => `Custom:${data.rowIndex}:${data.record.age}` : undefined,
    },
    { dataIndex: 'age', title: 'Age', width: 100, fixed: 'right', isFirstRightFixed: true },
  ];
  const operations = [{ name: 'extra', width: 40 }];
  return (
    <>
      <button onClick={() => setCustom(!custom)}>Custom</button>
      <button onClick={() => setLeft(!left)}>Align filter</button>
      <button onClick={() => setElement(th.current?.getThElement()?.tagName ?? '')}>
        Inspect header
      </button>
      <button onClick={() => done.current?.([{ key: 'child' }])}>Resolve children</button>
      <output>
        {headerClicks}:{rowClicks}:{loaded}:{element}
      </output>
      <output data-testid="filters">{JSON.stringify(filters)}</output>
      <TableContext.Provider
        value={{
          sorter,
          filters,
          filterIconAlignLeft: left,
          onSorterChange: (field, direction) =>
            setSorter(direction ? { field, direction } : undefined),
          onFilterChange: (field, values) => setFilters({ ...filters, [field]: values }),
          loadMore: (_, resolve) => {
            done.current = resolve;
          },
          addLazyLoadData: (_, row) => setLoaded(String(row.key)),
        }}
      >
        <div
          className="sd-table sd-table-size-large"
          style={{ 'width': 400, '--sd-table-grid-template': '40px 180px 100px' } as CSSProperties}
        >
          <div className="sd-table-element" style={{ gridTemplateColumns: '180px 100px' }}>
            <Thead component="section" data-testid="head">
              <Tr>
                <div />
                {columns.map((column, index) => (
                  <Th
                    key={column.dataIndex}
                    ref={index === 0 ? th : undefined}
                    column={column}
                    dataColumns={columns}
                    operations={operations}
                    resizable
                    onClick={() => setHeaderClicks((n) => n + 1)}
                  />
                ))}
              </Tr>
            </Thead>
            <Tbody component="article" data-testid="body">
              <Tr checked rowIndex={0} record={record} onClick={() => setRowClicks((n) => n + 1)}>
                <div />
                {columns.map((column, index) => (
                  <Td
                    key={column.dataIndex}
                    rowIndex={0}
                    record={record}
                    column={column}
                    operations={operations}
                    dataColumns={columns}
                    indentSize={index === 0 ? 16 : 0}
                    showExpandBtn={index === 0}
                    renderExpandBtn={() => <button>Expand row</button>}
                  />
                ))}
              </Tr>
              <Tr expand>
                <Td record={record} column={columns[0]} summary colSpan={2}>
                  Summary
                </Td>
              </Tr>
            </Tbody>
          </div>
        </div>
      </TableContext.Provider>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
