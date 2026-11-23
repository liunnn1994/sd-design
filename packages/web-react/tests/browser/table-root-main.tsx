import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
  SortDirection,
  TableColumnData,
  TableData,
  TableInstance,
} from '../../src/table/types.js';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Table } from '../../src/table/table.js';
import '../../styles/table.scss';

const data: TableData[] = [
  {
    key: 0,
    name: 'Beta',
    score: 30,
    kind: 'b',
    children: [{ key: 100, name: 'Child', score: 5, kind: 'b' }],
  },
  { key: 1, name: 'Alpha', score: 10, kind: 'a' },
  { key: 2, name: 'Gamma', score: 20, kind: 'b' },
  { key: 3, name: 'Delta', score: 40, kind: 'a' },
];

const resizeLead: TableColumnData = {
  dataIndex: '__proto__',
  title: 'Name',
  width: 150,
  fixed: 'right',
  render: ({ record }) => String(record.name),
};
const resizeScore: TableColumnData = {
  dataIndex: 'score',
  title: 'Score',
  width: 100,
  fixed: 'right',
};
const resizeKind: TableColumnData = {
  dataIndex: 'kind',
  title: 'Kind',
  width: 100,
  fixed: 'right',
};
function ColumnLifecycleFixture() {
  const [removed, setRemoved] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  return (
    <>
      <button onClick={() => setRemoved(!removed)}>Toggle score column</button>
      <output data-testid="column-resizes">{events.join('|')}</output>
      <div style={{ width: 360 }}>
        <Table
          data={data}
          columns={[
            resizeLead,
            {
              title: 'Outer',
              fixed: 'right',
              children: [
                { title: 'Inner', children: [...(removed ? [] : [resizeScore]), resizeKind] },
              ],
            },
          ]}
          columnResizable
          pagination={false}
          scroll={{ x: 600 }}
          onColumnResize={(field, width) => setEvents((old) => [...old, `${field}:${width}`])}
        />
      </div>
    </>
  );
}

const selectionTree: TableData[] = [
  {
    key: 'parent',
    name: 'Parent',
    children: [
      { key: 0, name: 'Zero', isLeaf: true },
      { key: 1, name: 'One', isLeaf: true },
      { key: 2, name: 'Disabled', isLeaf: true, disabled: true },
    ],
  },
];
function ControlledSelectionFixture() {
  const [selected, setSelected] = useState<(number | string)[]>([0, 'off-page']);
  const [requested, setRequested] = useState<(number | string)[]>([]);
  return (
    <>
      <button onClick={() => setSelected(requested)}>Accept selection</button>
      <output data-testid="requested-selection">{JSON.stringify(requested)}</output>
      <Table
        data={selectionTree}
        columns={[{ dataIndex: 'name' }]}
        pagination={false}
        defaultExpandAllRows
        rowSelection={{ type: 'checkbox', checkStrictly: false, showCheckedAll: true }}
        selectedKeys={selected}
        onSelectedKeysChange={setRequested}
      />
    </>
  );
}

const paginationColumns: TableColumnData[] = [{ dataIndex: 'name', title: 'Name' }];

function PageShrinkFixture() {
  const [rows, setRows] = useState(() => data.slice(1));
  const [page, setPage] = useState(1);
  return (
    <>
      <button onClick={() => setRows((current) => current.slice(0, -1))}>Remove last row</button>
      <output data-testid="controlled-page">{page}</output>
      <Table
        data={rows}
        columns={paginationColumns}
        pagination={{ current: page, pageSize: 1, onChange: setPage }}
      />
    </>
  );
}

function Fixture() {
  const query = new URLSearchParams(location.search);
  const controlled = query.has('controlled');
  const [order, setOrder] = useState<SortDirection>('');
  const [filters, setFilters] = useState<string[]>([]);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [change, setChange] = useState('');
  const [override, setOverride] = useState(false);
  const [renamed, setRenamed] = useState(false);
  const [mounted, setMounted] = useState(true);
  const api = useRef<TableInstance>(null);
  const record = (event: string) => setEvents((old) => [...old, event]);
  const columns: TableColumnData[] = [
    { dataIndex: 'name', title: 'Name', width: 180 },
    {
      dataIndex: 'score',
      title: renamed ? 'Updated score' : 'Score',
      width: 100,
      sortable: {
        sortDirections: ['ascend', 'descend'],
        sortOrder: controlled ? order : undefined,
      },
    },
    {
      dataIndex: 'kind',
      title: renamed ? 'Updated kind' : 'Kind',
      width: 100,
      filterable: {
        filters: [
          { text: 'B only', value: 'b' },
          { text: 'No rows', value: 'none' },
        ],
        multiple: true,
        filter: (values, row) => values.includes(String(row.kind)),
        filteredValue: controlled ? filters : undefined,
      },
    },
  ];
  return (
    <ConfigProvider
      size={query.has('config') ? 'small' : undefined}
      table={
        query.has('config')
          ? {
              pagination: false,
              bordered: false,
              stripe: true,
              showHeader: false,
              scrollbar: false,
            }
          : undefined
      }
      tableSpinProps={{ tip: 'Configured loading' }}
    >
      <button onClick={() => setOverride(true)}>Override config</button>
      <button onClick={() => setRenamed(true)}>Rename query columns</button>
      <button onClick={() => setMounted(!mounted)}>Toggle table</button>
      <button onClick={() => api.current?.selectAll()}>Ref select all</button>
      <button onClick={() => api.current?.expandAll()}>Ref expand all</button>
      <button onClick={() => api.current?.clearSorters()}>Clear sorter</button>
      <button
        onClick={() => {
          api.current?.clearFilters();
          api.current?.resetSorters();
        }}
      >
        Reset query
      </button>
      <button
        onClick={() => {
          setOrder('ascend');
          setFilters(['b']);
        }}
      >
        Accept external
      </button>
      <output data-testid="events">{events.join(',')}</output>
      <output data-testid="change">{change}</output>
      <output data-testid="selected">{JSON.stringify(selected)}</output>
      <div style={{ width: 650 }}>
        {mounted && (
          <Table
            ref={api}
            data={data}
            columns={columns}
            scroll={query.has('scroll-x') ? { x: 1000 } : undefined}
            pagination={
              query.has('config')
                ? undefined
                : query.has('no-page')
                  ? false
                  : {
                      defaultPageSize: 2,
                      showPageSize: true,
                      pageSizeOptions: [2, 4],
                      onChange: query.has('callbacks')
                        ? (page) => record(`pagination-page:${page}`)
                        : undefined,
                      onPageSizeChange: query.has('callbacks')
                        ? (size) => record(`pagination-size:${size}`)
                        : undefined,
                    }
            }
            bordered={override ? true : undefined}
            showHeader={override ? true : undefined}
            stripe={override ? false : undefined}
            loading={query.has('loading')}
            rowSelection={{ showCheckedAll: true, onlyCurrent: query.has('only-current') }}
            defaultSelectedKeys={['off-page']}
            expandable={{ expandedRowRender: (row) => `Detail:${row.name}` }}
            summary={query.has('summary')}
            summaryText="Total"
            footer={query.has('summary') ? 'Table footer' : undefined}
            spanMethod={
              query.has('span')
                ? ({ rowIndex, columnIndex }) =>
                    rowIndex === 0 && columnIndex === 0 ? { colspan: 2 } : undefined
                : undefined
            }
            onSelectedKeysChange={(keys) => {
              setSelected(keys);
              record('selected');
            }}
            onSelectionChange={() => record('selection')}
            onSorterChange={(field, direction) => record(`sort:${field}:${direction}`)}
            onFilterChange={(field, values) => record(`filter:${field}:${values.join('|')}`)}
            onPageChange={(page) => record(`page:${page}`)}
            onPageSizeChange={(size) => record(`size:${size}`)}
            onCellClick={() => record('cell')}
            onCellMouseEnter={
              query.has('hover')
                ? (row, column) => record(`enter:${row.key}:${column.dataIndex}`)
                : undefined
            }
            onCellMouseLeave={
              query.has('hover')
                ? (row, column) => record(`leave:${row.key}:${column.dataIndex}`)
                : undefined
            }
            onRowClick={() => record('row')}
            onChange={(raw, extra, sorted) => {
              record(`change:${extra.type}`);
              setChange(
                JSON.stringify({
                  keys: raw.map((row) => row.key),
                  sorted: sorted.map((row) => row.key),
                  page: extra.page,
                  size: extra.pageSize,
                  sorter: extra.sorter,
                  filters: extra.filters,
                }),
              );
            }}
          />
        )}
      </div>
    </ConfigProvider>
  );
}
const scenario = new URLSearchParams(location.search).get('scenario');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {scenario === 'column-lifecycle' ? (
      <ColumnLifecycleFixture />
    ) : scenario === 'controlled-selection' ? (
      <ControlledSelectionFixture />
    ) : scenario === 'page-shrink' ? (
      <PageShrinkFixture />
    ) : (
      <Fixture />
    )}
  </StrictMode>,
);
