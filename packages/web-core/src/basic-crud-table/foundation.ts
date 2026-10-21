import type { UnknownRecord } from 'type-fest';

import { isFunction, isNil, isString, omitBy } from 'es-toolkit';

import type {
  BasicCrudTableDataResult,
  BasicCrudTableModalSubmitContext,
  MaybePromise,
} from './types.js';
export interface BasicCrudTablePagination {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
}
export function resolvePaginationNumber(
  pagination: BasicCrudTablePagination | boolean | undefined,
  defaultPageSize: number | undefined,
  controlled: 'current' | 'pageSize',
  initial: 'defaultCurrent' | 'defaultPageSize',
  fallback: number,
) {
  if (typeof pagination === 'object') {
    const value = pagination[controlled] ?? pagination[initial];
    if (value !== undefined) return Number(value);
  }
  return initial === 'defaultPageSize' ? Number(defaultPageSize ?? fallback) : fallback;
}
export interface BasicCrudTableChange {
  type: string;
  sorter?: { field?: string | undefined; direction?: string | undefined } | undefined;
}
export interface BasicCrudTableFoundationState<Row extends Record<string, unknown>> {
  readonly props: {
    readonly fetchTableApi: ((params: UnknownRecord) => MaybePromise<unknown>) | undefined;
    readonly tableDataTransformer:
      | ((data: unknown) => MaybePromise<BasicCrudTableDataResult<Row>>)
      | undefined;
    readonly fetchExcludeEmptyValues: boolean;
    readonly openCreateModal: boolean;
    readonly deleteContent: string | ((row: Row) => MaybePromise<string>) | undefined;
    readonly deleteApi: ((row: Row) => MaybePromise<unknown>) | undefined;
    readonly beforeDelete: ((row: Row) => MaybePromise<boolean | void>) | undefined;
  };
  loading: boolean;
  toolbarModel: UnknownRecord;
  readonly params: UnknownRecord;
  tableData: Row[];
  current: number;
  pageSize: number;
  total: number;
  sorter: UnknownRecord;
  fetchData: unknown;
  customDeleteConfirmContent: string | undefined;
  pendingDeleteRow: Row | undefined;
}
export function createBasicCrudTableFoundation<Row extends Record<string, unknown>>(
  state: BasicCrudTableFoundationState<Row>,
  callbacks: {
    create(): void;
    edit(row: Row, context?: unknown): void;
    delete(row: Row, context?: unknown): void;
    reset(): void;
    search(params: UnknownRecord): void;
    tableFetched(rows: Row[], result: BasicCrudTableDataResult<Row>): void;
    modalSuccess(result: unknown, context: BasicCrudTableModalSubmitContext<Row>): void;
    error(error: unknown): void;
    afterRender(): Promise<unknown>;
    resetToolbar(): void;
    openModal(row?: Row): Promise<boolean> | undefined;
  },
) {
  let fetchRequestId = 0;
  function isObjectResult(value: unknown): value is Exclude<BasicCrudTableDataResult<Row>, Row[]> {
    return (
      !!value && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
    );
  }
  function getParams() {
    return {
      current: state.current,
      pageSize: state.pageSize,
      ...state.sorter,
      ...state.toolbarModel,
    };
  }
  async function handleFetchData(fetchParams: UnknownRecord = state.params) {
    if (isNil(state.props.fetchTableApi)) return;
    const requestId = ++fetchRequestId;
    state.loading = true;
    try {
      const requestParams = state.props.fetchExcludeEmptyValues
        ? omitBy(fetchParams, (value) => value === '' || value === null || value === undefined)
        : fetchParams;
      const response = await state.props.fetchTableApi(requestParams);
      if (requestId !== fetchRequestId) return;
      const result = isFunction(state.props.tableDataTransformer)
        ? await state.props.tableDataTransformer(response)
        : (response as BasicCrudTableDataResult<Row>);
      if (requestId !== fetchRequestId) return;
      state.fetchData = response;
      if (Array.isArray(result)) {
        state.tableData = result;
        state.total = result.length;
      } else if (isObjectResult(result)) {
        state.tableData = result.data;
        state.total = result.total ?? result.count ?? result.data.length;
      } else return;
      callbacks.tableFetched(state.tableData, result);
    } catch (error) {
      if (requestId === fetchRequestId) callbacks.error(error);
    } finally {
      if (requestId === fetchRequestId) state.loading = false;
    }
  }
  async function handleSearch() {
    state.current = 1;
    await handleFetchData();
    callbacks.search(state.toolbarModel);
  }
  async function handleReset() {
    state.current = 1;
    state.sorter = {};
    // 等待工具栏 v-model 同步：Toolbar.reset 先改 modelValue 再 emit 'reset'，
    // defineModel 的 update 是 flush:'pre' 异步触发，不等待会用旧筛选值请求。
    await callbacks.afterRender();
    await handleFetchData();
    callbacks.reset();
  }

  /** 仅重置工具栏筛选项，不触发列表请求。 */
  function resetToolbar() {
    callbacks.resetToolbar();
  }

  /** 重置工具栏筛选、分页与排序，并重新请求列表。 */
  async function reset() {
    resetToolbar();
    await handleReset();
  }

  function handleCreate() {
    if (state.props.openCreateModal) void callbacks.openModal();
    callbacks.create();
  }
  async function handleEdit(row: Row, context?: unknown) {
    if (await callbacks.openModal(row)) callbacks.edit(row, context);
  }
  let deleteContentRequestId = 0;

  function resolveDeleteContent(row: Row): string | Promise<string> | undefined {
    if (isString(state.props.deleteContent)) return state.props.deleteContent;
    if (isFunction(state.props.deleteContent)) return state.props.deleteContent(row);
    return undefined;
  }

  async function handleDeletePopupChange(visible: boolean, row: Row) {
    if (!visible) {
      if (state.pendingDeleteRow === row) {
        state.pendingDeleteRow = undefined;
        deleteContentRequestId++;
      }
      return;
    }
    state.pendingDeleteRow = row;
    const requestId = ++deleteContentRequestId;
    state.customDeleteConfirmContent = undefined;
    try {
      const content = await resolveDeleteContent(row);
      if (requestId === deleteContentRequestId) state.customDeleteConfirmContent = content;
    } catch (error) {
      if (requestId === deleteContentRequestId) callbacks.error(error);
    }
  }

  async function executeDelete(row: Row, context?: unknown): Promise<boolean> {
    try {
      if (state.props.beforeDelete && (await state.props.beforeDelete(row)) === false) return false;
      callbacks.delete(row, context);
      if (state.props.deleteApi) await state.props.deleteApi(row);
      await handleFetchData();
      return true;
    } catch (error) {
      callbacks.error(error);
      return false;
    }
  }

  async function handleModalSuccess(
    result: unknown,
    context: BasicCrudTableModalSubmitContext<Row>,
  ) {
    await handleFetchData();
    callbacks.modalSuccess(result, context);
  }
  async function handlePageChange(value: number) {
    state.current = value;
    await handleFetchData();
  }
  async function handlePageSizeChange(value: number) {
    state.pageSize = value;
    state.current = 1;
    await handleFetchData();
  }
  async function handleTableChange(_data: Row[], extra: BasicCrudTableChange) {
    if (extra.type !== 'sorter') return;
    state.sorter =
      extra.sorter?.field && extra.sorter.direction
        ? {
            sort_by:
              extra.sorter.direction === 'descend' ? `-${extra.sorter.field}` : extra.sorter.field,
          }
        : {};
    state.current = 1;
    await handleFetchData();
  }

  function dispose() {
    fetchRequestId++;
    deleteContentRequestId++;
  }
  return {
    handleFetchData,
    handleSearch,
    handleReset,
    resetToolbar,
    reset,
    handleCreate,
    handleEdit,
    resolveDeleteContent,
    handleDeletePopupChange,
    executeDelete,
    handleModalSuccess,
    handlePageChange,
    handlePageSizeChange,
    handleTableChange,
    getParams,
    dispose,
  };
}
