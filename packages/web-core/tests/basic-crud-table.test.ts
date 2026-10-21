import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createBasicCrudTableFoundation,
  resolvePaginationNumber,
  type BasicCrudTableFoundationState,
} from '../dist/basic-crud-table/foundation.js';
import {
  createBasicCrudModalFoundation,
  type BasicCrudModalFoundationState,
} from '../dist/basic-crud-table/modal.js';

type Row = { id: number; name?: string };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function table() {
  const state: BasicCrudTableFoundationState<Row> = {
    props: {
      fetchTableApi: undefined,
      tableDataTransformer: undefined,
      fetchExcludeEmptyValues: false,
      openCreateModal: true,
      deleteContent: undefined,
      deleteApi: undefined,
      beforeDelete: undefined,
    },
    loading: false,
    toolbarModel: {},
    get params() {
      return {
        current: this.current,
        pageSize: this.pageSize,
        ...this.sorter,
        ...this.toolbarModel,
      };
    },
    tableData: [],
    current: 3,
    pageSize: 20,
    total: 0,
    sorter: {},
    fetchData: undefined,
    customDeleteConfirmContent: undefined,
    pendingDeleteRow: undefined,
  };
  // Production adapters expose live readonly getters; replace the object to change props here.
  const props = (next: Partial<typeof state.props>) => {
    Object.assign(state, { props: { ...state.props, ...next } });
  };
  const events: unknown[][] = [];
  const callbacks = {
    create: () => {
      events.push(['create']);
    },
    edit: (row: Row, context?: unknown) => {
      events.push(['edit', row, context]);
    },
    delete: (row: Row, context?: unknown) => {
      events.push(['delete', row, context]);
    },
    reset: () => {
      events.push(['reset']);
    },
    search: (value: unknown) => {
      events.push(['search', value]);
    },
    tableFetched: (rows: Row[], result: unknown) => {
      events.push(['fetched', rows, result]);
    },
    modalSuccess: (result: unknown, context: unknown) => {
      events.push(['success', result, context]);
    },
    error: (error: unknown) => {
      events.push(['error', error]);
    },
    afterRender: async () => {},
    resetToolbar: () => {
      events.push(['toolbar-reset']);
    },
    openModal: async (_row?: Row) => true,
  };
  return {
    state,
    props,
    callbacks,
    events,
    foundation: createBasicCrudTableFoundation(state, callbacks),
  };
}
function modal() {
  const state: BasicCrudModalFoundationState<Row> = {
    props: {
      createApi: undefined,
      updateApi: undefined,
      detailApi: undefined,
      valueTransformer: undefined,
      beforeSubmit: undefined,
    },
    visible: false,
    model: { nested: { text: 'initial' } },
    type: 'create',
    editingRow: undefined,
  };
  const props = (next: Partial<typeof state.props>) => {
    Object.assign(state, { props: { ...state.props, ...next } });
  };
  const events: unknown[][] = [];
  const callbacks = {
    afterRender: async () => {},
    validate: async (): Promise<unknown> => undefined,
    resetFields: () => {
      events.push(['reset']);
    },
    clearValidate: () => {
      events.push(['clear']);
    },
    success: (result: unknown, context: unknown) => {
      events.push(['success', result, context]);
    },
    close: () => {
      events.push(['close']);
    },
    error: (error: unknown) => {
      events.push(['error', error]);
    },
  };
  return {
    state,
    props,
    events,
    callbacks,
    foundation: createBasicCrudModalFoundation(state, callbacks),
  };
}

test('pagination preserves controlled zero, local defaults and provider fallback', () => {
  assert.equal(
    resolvePaginationNumber({ current: 0, defaultCurrent: 4 }, 30, 'current', 'defaultCurrent', 1),
    0,
  );
  assert.equal(
    resolvePaginationNumber({ defaultPageSize: 5 }, 30, 'pageSize', 'defaultPageSize', 10),
    5,
  );
  assert.equal(resolvePaginationNumber(true, 30, 'pageSize', 'defaultPageSize', 10), 30);
  assert.equal(resolvePaginationNumber(false, undefined, 'current', 'defaultCurrent', 1), 1);
});
test('request precedence and optional empty filtering preserve false and zero', async () => {
  const f = table();
  let received: unknown;
  f.state.sorter = { sort_by: '-id' };
  f.state.toolbarModel = {
    current: 8,
    sort_by: 'name',
    empty: '',
    nil: null,
    absent: undefined,
    zero: 0,
    off: false,
  };
  f.props({
    fetchExcludeEmptyValues: true,
    fetchTableApi: (params) => {
      received = params;
      return [];
    },
  });
  await f.foundation.handleFetchData();
  assert.deepEqual(received, { current: 8, pageSize: 20, sort_by: 'name', zero: 0, off: false });
  assert.equal(f.state.toolbarModel.empty, '');
});
test('raw array, count and total responses retain row identity and explicit total zero', async () => {
  const f = table();
  const rows = [{ id: 1 }];
  for (const [response, total] of [
    [rows, 1],
    [{ data: rows, count: 12 }, 12],
    [{ data: rows, count: 12, total: 0 }, 0],
  ] as const) {
    f.props({ fetchTableApi: () => response });
    await f.foundation.handleFetchData();
    assert.equal(f.state.tableData, rows);
    assert.equal(f.state.total, total);
    assert.equal(f.state.fetchData, response);
    assert.equal(f.events.at(-1)?.[2], response);
  }
});
test('absent API is a no-op; invalid results keep rows but expose raw response', async () => {
  const f = table();
  await f.foundation.handleFetchData();
  assert.deepEqual(f.events, []);
  f.state.tableData = [{ id: 1 }];
  f.props({ fetchTableApi: () => ({ invalid: true }) });
  await f.foundation.handleFetchData();
  assert.deepEqual(f.state.tableData, [{ id: 1 }]);
  assert.deepEqual(f.state.fetchData, { invalid: true });
  assert.equal(f.state.loading, false);
  assert.deepEqual(f.events, []);
});
test('superseded API failure neither clears current loading nor emits an error', async () => {
  const f = table(),
    a = deferred<unknown>(),
    b = deferred<unknown>();
  f.props({ fetchTableApi: () => a.promise });
  const first = f.foundation.handleFetchData();
  f.props({ fetchTableApi: () => b.promise });
  const second = f.foundation.handleFetchData();
  a.reject(new Error('stale'));
  await first;
  assert.equal(f.state.loading, true);
  assert.deepEqual(f.events, []);
  b.resolve([{ id: 2 }]);
  await second;
  assert.deepEqual(f.state.tableData, [{ id: 2 }]);
  assert.equal(f.state.loading, false);
});
test('superseding a pending transformer prevents stale publication', async () => {
  const f = table(),
    transform = deferred<Row[]>();
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  f.props({
    fetchTableApi: () => 'old',
    tableDataTransformer: () => {
      started();
      return transform.promise;
    },
  });
  const first = f.foundation.handleFetchData();
  await ready;
  f.props({ fetchTableApi: () => [{ id: 2 }], tableDataTransformer: undefined });
  await f.foundation.handleFetchData();
  transform.resolve([{ id: 1 }]);
  await first;
  assert.deepEqual(f.state.tableData, [{ id: 2 }]);
  assert.equal(f.events.length, 1);
});
test('dispose invalidates pending response and async delete content', async () => {
  const f = table(),
    request = deferred<unknown>(),
    content = deferred<string>();
  f.props({ fetchTableApi: () => request.promise, deleteContent: () => content.promise });
  const a = f.foundation.handleFetchData(),
    b = f.foundation.handleDeletePopupChange(true, { id: 1 });
  f.foundation.dispose();
  request.resolve([{ id: 1 }]);
  content.resolve('stale');
  await Promise.all([a, b]);
  assert.equal(f.state.fetchData, undefined);
  assert.equal(f.state.customDeleteConfirmContent, undefined);
  assert.deepEqual(f.events, []);
});
test('reset awaits adapter synchronization before reading toolbar model', async () => {
  const f = table();
  let request: unknown;
  f.callbacks.resetToolbar = () => {
    f.events.push(['toolbar-reset']);
  };
  f.callbacks.afterRender = async () => {
    f.state.toolbarModel = { term: 'reset' };
  };
  f.state.sorter = { sort_by: 'name' };
  f.props({
    fetchTableApi: (params) => {
      request = params;
      return [];
    },
  });
  await f.foundation.reset();
  assert.deepEqual(request, { current: 1, pageSize: 20, term: 'reset' });
  assert.deepEqual(
    f.events.map((e) => e[0]),
    ['toolbar-reset', 'fetched', 'reset'],
  );
});
test('paging and sorting retain request order, search emits after fetch', async () => {
  const f = table();
  const requests: unknown[] = [];
  f.props({
    fetchTableApi: (params) => {
      requests.push(params);
      return [];
    },
  });
  await f.foundation.handlePageChange(5);
  await f.foundation.handlePageSizeChange(50);
  await f.foundation.handleTableChange([], {
    type: 'sorter',
    sorter: { field: 'name', direction: 'descend' },
  });
  await f.foundation.handleTableChange([], { type: 'filter' });
  await f.foundation.handleTableChange([], { type: 'sorter' });
  await f.foundation.handleSearch();
  assert.deepEqual(requests, [
    { current: 5, pageSize: 20 },
    { current: 1, pageSize: 50 },
    { current: 1, pageSize: 50, sort_by: '-name' },
    { current: 1, pageSize: 50 },
    { current: 1, pageSize: 50 },
  ]);
  assert.equal(f.events.at(-1)?.[0], 'search');
});
test('delete content is row-specific and closing an older row cannot invalidate the newer row', async () => {
  const f = table(),
    a = deferred<string>(),
    b = deferred<string>(),
    r1 = { id: 1 },
    r2 = { id: 2 };
  f.props({ deleteContent: (row) => (row === r1 ? a.promise : b.promise) });
  const first = f.foundation.handleDeletePopupChange(true, r1),
    second = f.foundation.handleDeletePopupChange(true, r2);
  await f.foundation.handleDeletePopupChange(false, r1);
  a.resolve('old');
  b.resolve('new');
  await Promise.all([first, second]);
  assert.equal(f.state.customDeleteConfirmContent, 'new');
  assert.equal(f.state.pendingDeleteRow, r2);
});
test('closed delete popup ignores content rejection while current errors surface', async () => {
  const f = table(),
    content = deferred<string>(),
    row = { id: 1 },
    error = new Error('failed');
  f.props({ deleteContent: () => content.promise });
  const pending = f.foundation.handleDeletePopupChange(true, row);
  await f.foundation.handleDeletePopupChange(false, row);
  content.reject(error);
  await pending;
  assert.deepEqual(f.events, []);
  f.props({ deleteContent: () => Promise.reject(error) });
  await f.foundation.handleDeletePopupChange(true, row);
  assert.deepEqual(f.events, [['error', error]]);
});
test('delete guards, API errors and refresh preserve event ordering and retry', async () => {
  const f = table(),
    row = { id: 1 },
    context = {};
  let deletes = 0;
  f.props({
    beforeDelete: () => false,
    deleteApi: () => {
      deletes++;
    },
    fetchTableApi: () => [],
  });
  assert.equal(await f.foundation.executeDelete(row, context), false);
  assert.equal(deletes, 0);
  f.props({ beforeDelete: undefined });
  assert.equal(await f.foundation.executeDelete(row, context), true);
  assert.deepEqual(
    f.events.map((e) => e[0]),
    ['delete', 'fetched'],
  );
  assert.equal(f.events[0]?.[1], row);
  assert.equal(f.events[0]?.[2], context);
  const error = new Error('delete');
  f.props({
    deleteApi: () => {
      throw error;
    },
  });
  assert.equal(await f.foundation.executeDelete(row), false);
  assert.deepEqual(f.events.at(-1), ['error', error]);
});
test('create opt-out, unsuccessful edit and modal refresh forward the original context', async () => {
  const f = table(),
    row = { id: 1 },
    context = { type: 'edit' as const, row, model: {} };
  let opens = 0;
  f.callbacks.openModal = async () => {
    opens++;
    return false;
  };
  f.props({ openCreateModal: false });
  f.foundation.handleCreate();
  await f.foundation.handleEdit(row);
  assert.equal(opens, 1);
  assert.deepEqual(f.events, [['create']]);
  f.callbacks.openModal = async () => true;
  await f.foundation.handleEdit(row, context);
  f.props({ fetchTableApi: () => [] });
  await f.foundation.handleModalSuccess('result', context);
  assert.deepEqual(
    f.events.map((e) => e[0]),
    ['create', 'edit', 'fetched', 'success'],
  );
  assert.equal(f.events.at(-1)?.[2], context);
});
test('modal snapshots nested defaults and resets with form callbacks in order', async () => {
  const f = modal();
  (f.state.model.nested as { text: string }).text = 'mutated';
  await f.foundation.open();
  assert.deepEqual(f.state.model, { nested: { text: 'initial' } });
  (f.state.model.nested as { text: string }).text = 'edited';
  f.foundation.handleClose();
  assert.deepEqual(f.state.model, { nested: { text: 'initial' } });
  assert.equal(f.state.type, 'create');
  assert.deepEqual(f.events, [['clear'], ['reset'], ['clear'], ['close']]);
});
test('latest edit detail wins and transforms without changing editing row identity', async () => {
  const f = modal(),
    a = deferred<Record<string, unknown>>(),
    r1 = { id: 1 },
    r2 = { id: 2 };
  f.props({
    detailApi: (row) => (row === r1 ? a.promise : { name: 'new' }),
    valueTransformer: (data) => ({ ...data, extra: true }),
  });
  const first = f.foundation.open(r1);
  assert.equal(await f.foundation.open(r2), true);
  a.resolve({ name: 'old' });
  assert.equal(await first, false);
  assert.deepEqual(f.state.model, { name: 'new', extra: true });
  assert.equal(f.state.editingRow, r2);
});
test('create supersedes pending edit and stale errors do not surface', async () => {
  const f = modal(),
    pending = deferred<Record<string, unknown>>();
  f.props({ detailApi: () => pending.promise });
  const edit = f.foundation.open({ id: 1 });
  await f.foundation.open();
  pending.reject(new Error('stale'));
  assert.equal(await edit, false);
  assert.equal(f.state.type, 'create');
  assert.deepEqual(f.events, [['clear']]);
});
test('render barrier and disposal prevent stale clearValidate calls', async () => {
  const f = modal(),
    rendered = deferred<void>();
  f.callbacks.afterRender = () => rendered.promise;
  const opening = f.foundation.open();
  f.foundation.dispose();
  rendered.resolve();
  assert.equal(await opening, false);
  assert.deepEqual(f.events, []);
});
test('pending validation cannot submit a closed or replacement modal', async () => {
  const f = modal(),
    validation = deferred<unknown>();
  let calls = 0;
  f.callbacks.validate = () => validation.promise;
  f.props({
    createApi: () => {
      calls++;
    },
  });
  await f.foundation.open();
  const submission = f.foundation.handleBeforeOk();
  f.foundation.handleClose();
  await f.foundation.open();
  validation.resolve(undefined);
  assert.equal(await submission, false);
  assert.equal(calls, 0);
});
test('pending beforeSubmit cannot call a replacement modal API', async () => {
  const f = modal(),
    hook = deferred<boolean>();
  let started!: () => void;
  let calls = 0;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  f.props({
    beforeSubmit: () => {
      started();
      return hook.promise;
    },
    createApi: () => {
      calls++;
    },
    updateApi: () => {
      calls++;
    },
  });
  await f.foundation.open({ id: 1 });
  const submission = f.foundation.handleBeforeOk();
  await ready;
  f.foundation.handleClose();
  await f.foundation.open();
  hook.resolve(true);
  assert.equal(await submission, false);
  assert.equal(calls, 0);
  assert.equal(f.state.type, 'create');
});
test('validation failures and rejected hooks keep form values for retry', async () => {
  const f = modal(),
    error = new Error('hook');
  let calls = 0;
  await f.foundation.open();
  f.state.model = { name: 'kept' };
  f.callbacks.validate = async () => ({ name: 'required' });
  f.props({
    createApi: () => {
      calls++;
    },
    beforeSubmit: () => {
      throw error;
    },
  });
  assert.equal(await f.foundation.handleBeforeOk(), false);
  assert.equal(f.events.length, 1);
  f.callbacks.validate = async () => undefined;
  assert.equal(await f.foundation.handleBeforeOk(), false);
  assert.deepEqual(f.events.at(-1), ['error', error]);
  assert.deepEqual(f.state.model, { name: 'kept' });
  f.props({ beforeSubmit: undefined });
  assert.equal(await f.foundation.handleBeforeOk(), true);
  assert.equal(calls, 1);
});
test('edit submission carries exact row/model context and awaits update API', async () => {
  const f = modal(),
    row = { id: 2 },
    api = deferred<unknown>();
  let received: unknown;
  await f.foundation.open(row);
  assert.notEqual(f.state.model, row);
  f.props({
    updateApi: (data) => {
      received = data;
      return api.promise;
    },
  });
  const submission = f.foundation.handleBeforeOk();
  await Promise.resolve();
  assert.equal(received, f.state.model);
  assert.equal(f.events.length, 1);
  api.resolve('saved');
  assert.equal(await submission, true);
  assert.deepEqual(f.events.at(-1), [
    'success',
    'saved',
    { type: 'edit', row, model: f.state.model },
  ]);
});
