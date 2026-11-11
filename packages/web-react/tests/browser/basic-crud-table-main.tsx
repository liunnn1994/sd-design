import type { UnknownRecord } from 'type-fest';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { BasicCrudTableInstance } from '../../src/basic-crud-table/types.js';
import type { TableData } from '../../src/table/index.js';

import { BasicCrudTable } from '../../src/basic-crud-table/basic-crud-table.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import '../../styles/basic-crud-table.scss';

type Person = TableData & { key: number; name: string };
function Fixture() {
  const query = new URLSearchParams(location.search);
  const database = useRef<Person[]>([
    { key: 1, name: 'Alpha' },
    { key: 2, name: 'Beta' },
    { key: 3, name: 'Gamma' },
  ]);
  const api = useRef<BasicCrudTableInstance<Person>>(null);
  const requests = useRef<((value: unknown) => void)[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [lastParams, setLastParams] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [rows, setRows] = useState<Person[]>([]);
  const [filters, setFilters] = useState<UnknownRecord>({ q: '', nil: null, zero: 0, flag: false });
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState('');
  const [mounted, setMounted] = useState(true);
  const controlled = query.has('controlled');
  const record = (event: string) => setEvents((old) => [...old, event]);
  return (
    <ConfigProvider basicCrudTableSpinProps={{ tip: 'Fetching rows', delay: 0 }}>
      <button
        onClick={() => {
          void api.current?.fetchTableData({ current: 1, pageSize: 1, tag: 'first' });
        }}
      >
        Fetch first
      </button>
      <button
        onClick={() => {
          void api.current?.fetchTableData({ current: 1, pageSize: 1, tag: 'second' });
        }}
      >
        Fetch second
      </button>
      <button
        onClick={() => requests.current[0]?.({ data: [{ key: 4, name: 'Stale row' }], total: 1 })}
      >
        Resolve first
      </button>
      <button
        onClick={() => requests.current[1]?.({ data: [{ key: 5, name: 'Latest row' }], total: 1 })}
      >
        Resolve second
      </button>
      <button
        onClick={() => {
          api.current?.resetToolbar();
        }}
      >
        Reset toolbar only
      </button>
      <button
        onClick={() => {
          void api.current?.resetTable();
        }}
      >
        Reset table only
      </button>
      <button
        onClick={() => {
          void api.current?.reset();
        }}
      >
        Reset all
      </button>
      <button
        onClick={() => {
          setSnapshot(
            JSON.stringify({
              rows: api.current?.tableData,
              fetched: api.current?.fetchData,
              isCreate: api.current?.isCreate,
            }),
          );
        }}
      >
        Read instance
      </button>
      <button onClick={() => setMounted(false)}>Unmount</button>
      <output data-testid="params">{lastParams}</output>
      <output data-testid="requests">{requestCount}</output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="instance">{snapshot}</output>
      {mounted && (
        <div style={{ height: query.has('full-height') ? 400 : undefined }}>
          <BasicCrudTable<Person>
            ref={api}
            title="People"
            className="consumer-crud"
            style={{ maxWidth: 900 }}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                slotName: query.has('slots') ? 'person' : undefined,
                sortable: { sortDirections: ['ascend', 'descend'] },
              },
            ]}
            tableProps={{
              pagination: query.has('full-height') ? false : { defaultPageSize: 1 },
              scroll: { x: 600 },
            }}
            fullHeight={query.has('full-height')}
            defaultTableData={
              query.has('full-height')
                ? Array.from({ length: 20 }, (_, index) => ({
                    key: index,
                    name: `Person ${index}`,
                  }))
                : undefined
            }
            toolbarProps={{
              schemas: [{ field: 'q', type: 'input', label: 'Query' }],
              resetSkipKeys: ['zero'],
              onSearch: () => record('toolbar-search'),
              onReset: () => record('toolbar-reset'),
            }}
            defaultToolbarModel={filters}
            toolbarModel={controlled ? filters : undefined}
            onToolbarModelChange={setFilters}
            tableData={controlled ? rows : undefined}
            onTableDataChange={setRows}
            loading={controlled ? busy : undefined}
            onLoadingChange={setBusy}
            fetchTableOnMounted={!query.has('deferred') && !query.has('full-height')}
            fetchExcludeEmptyValues={query.has('exclude')}
            fetchTableApi={async (params) => {
              setLastParams(JSON.stringify(params));
              setRequestCount((count) => count + 1);
              if (query.has('deferred'))
                return await new Promise((resolve) => requests.current.push(resolve));
              const data = database.current.filter((row) =>
                row.name.toLowerCase().includes(String(params.q ?? '').toLowerCase()),
              );
              if (params.sort_by === '-name') data.reverse();
              const start = (Number(params.current) - 1) * Number(params.pageSize);
              return {
                data: data.slice(start, start + Number(params.pageSize)),
                total: data.length,
              };
            }}
            modalFormProps={{
              schemas: [{ field: 'name', label: 'Name', type: 'input', required: true }],
              slots: { extra: () => <b data-testid="native-extra">Native field extra</b> },
            }}
            modalProps={{ modalAnimationName: '', maskAnimationName: '' }}
            createApi={async (model) => {
              database.current.push({ key: 4, name: String(model.name) });
              record('created');
              return 'create result';
            }}
            updateApi={async (model) => {
              const row = database.current.find((item) => item.key === model.key);
              if (row) row.name = String(model.name);
              record('updated');
              return 'update result';
            }}
            detailApi={async (row) => ({ ...row })}
            deleteApi={async (row) => {
              database.current = database.current.filter((item) => item.key !== row.key);
              record('deleted');
            }}
            beforeDelete={query.has('veto-delete') ? () => false : undefined}
            deleteContent={
              query.has('custom-delete') ? async (row) => `Remove ${row.name}?` : undefined
            }
            deleteNameKey="name"
            onCreate={() => record('create')}
            onEdit={(row) => record(`edit:${row.key}`)}
            onDelete={(row) => record(`delete:${row.key}`)}
            onSearch={() => record('search')}
            onReset={() => record('reset')}
            onTableFetched={(data) => record(`fetched:${data.length}`)}
            onModalSuccess={(result) => record(`success:${String(result)}`)}
            onModalClose={() => record('close')}
            onError={(error) => record(`error:${String(error)}`)}
            slots={
              query.has('slots')
                ? {
                    header__title: ({ title }) => <b data-testid="title">Title:{String(title)}</b>,
                    table__person: ({ record: row }) => (
                      <b data-testid="person">Person:{String((row as Person).name)}</b>
                    ),
                    table__action_prepend: () => <i data-testid="row-action">Before</i>,
                    toolbar__action_middle: () => <i data-testid="toolbar-action">Middle</i>,
                    modal__title: ({ type }) => (
                      <b data-testid="modal-title">Modal:{String(type)}</b>
                    ),
                  }
                : undefined
            }
          />
        </div>
      )}
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
