import type {
  BasicCrudTableDataResult,
  BasicCrudTableModalSubmitContext,
} from '@sdata/web-core/basic-crud-table/types';
import type { UnknownRecord } from 'type-fest';

import {
  createBasicCrudTableFoundation,
  resolvePaginationNumber,
  type BasicCrudTableFoundationState,
  type BasicCrudTablePagination,
} from '@sdata/web-core/basic-crud-table/foundation';
import { useEffect, useReducer, useRef, useState, type RefObject } from 'react';

import type { TableData } from '../table/index.js';
import type { ToolbarInstance } from '../toolbar/index.js';
import type { CrudModalInstance } from './modal.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useCrudModel } from './use-model.js';

type CrudApis<Row extends TableData> = Partial<BasicCrudTableFoundationState<Row>['props']>;
export interface CrudTableOptions<Row extends TableData> extends CrudApis<Row> {
  loading?: boolean;
  onLoadingChange?(value: boolean): void;
  toolbarModel?: UnknownRecord;
  defaultToolbarModel?: UnknownRecord;
  onToolbarModelChange?(model: UnknownRecord): void;
  tableData?: Row[];
  defaultTableData?: Row[];
  onTableDataChange?(rows: Row[]): void;
  pagination?: BasicCrudTablePagination | boolean | undefined;
  defaultPageSize?: number | undefined;
  fetchTableOnMounted?: boolean;
  onCreate?(): void;
  onEdit?(row: Row, context?: unknown): void;
  onDelete?(row: Row, context?: unknown): void;
  onReset?(): void;
  onSearch?(params: UnknownRecord): void;
  onTableFetched?(rows: Row[], result: BasicCrudTableDataResult<Row>): void;
  onModalSuccess?(result: unknown, context: BasicCrudTableModalSubmitContext<Row>): void;
  onError?(error: unknown): void;
}

export function useCrudTable<Row extends TableData>(
  options: CrudTableOptions<Row>,
  toolbar: RefObject<ToolbarInstance | null>,
  modal: RefObject<CrudModalInstance<Row> | null>,
) {
  const current = useRef(options);
  current.current = options;
  const loading = useCrudModel(options.loading, false, options.onLoadingChange);
  const toolbarModel = useCrudModel(
    options.toolbarModel,
    options.defaultToolbarModel ?? {},
    options.onToolbarModelChange,
  );
  const tableData = useCrudModel(
    options.tableData,
    options.defaultTableData ?? [],
    options.onTableDataChange,
  );
  const [, redraw] = useReducer((version: number) => version + 1, 0);
  const afterRender = useAfterRender();
  const internal = useRef({
    current: resolvePaginationNumber(
      options.pagination,
      options.defaultPageSize,
      'current',
      'defaultCurrent',
      1,
    ),
    pageSize: resolvePaginationNumber(
      options.pagination,
      options.defaultPageSize,
      'pageSize',
      'defaultPageSize',
      10,
    ),
    total: 0,
    sorter: {} as UnknownRecord,
    fetchData: undefined as unknown,
    customDeleteConfirmContent: undefined as string | undefined,
    pendingDeleteRow: undefined as Row | undefined,
  });
  function update<Key extends keyof typeof internal.current>(
    key: Key,
    value: (typeof internal.current)[Key],
  ) {
    if (Object.is(internal.current[key], value)) return;
    internal.current[key] = value;
    redraw();
  }
  const [foundation] = useState(() =>
    createBasicCrudTableFoundation<Row>(
      {
        props: {
          get fetchTableApi() {
            return current.current.fetchTableApi;
          },
          get tableDataTransformer() {
            return current.current.tableDataTransformer;
          },
          get fetchExcludeEmptyValues() {
            return current.current.fetchExcludeEmptyValues ?? false;
          },
          get openCreateModal() {
            return current.current.openCreateModal ?? true;
          },
          get deleteContent() {
            return current.current.deleteContent;
          },
          get deleteApi() {
            return current.current.deleteApi;
          },
          get beforeDelete() {
            return current.current.beforeDelete;
          },
        },
        get loading() {
          return loading.value;
        },
        set loading(next) {
          loading.value = next;
        },
        get toolbarModel() {
          return toolbarModel.value;
        },
        set toolbarModel(next) {
          toolbarModel.value = next;
        },
        get tableData() {
          return tableData.value;
        },
        set tableData(next) {
          tableData.value = next;
        },
        get params(): UnknownRecord {
          return foundation.getParams();
        },
        get current() {
          return internal.current.current;
        },
        set current(next) {
          update('current', next);
        },
        get pageSize() {
          return internal.current.pageSize;
        },
        set pageSize(next) {
          update('pageSize', next);
        },
        get total() {
          return internal.current.total;
        },
        set total(next) {
          update('total', next);
        },
        get sorter() {
          return internal.current.sorter;
        },
        set sorter(next) {
          update('sorter', next);
        },
        get fetchData() {
          return internal.current.fetchData;
        },
        set fetchData(next) {
          update('fetchData', next);
        },
        get customDeleteConfirmContent() {
          return internal.current.customDeleteConfirmContent;
        },
        set customDeleteConfirmContent(next) {
          update('customDeleteConfirmContent', next);
        },
        get pendingDeleteRow() {
          return internal.current.pendingDeleteRow;
        },
        set pendingDeleteRow(next) {
          update('pendingDeleteRow', next);
        },
      },
      {
        create: () => current.current.onCreate?.(),
        edit: (row, context) => current.current.onEdit?.(row, context),
        delete: (row, context) => current.current.onDelete?.(row, context),
        reset: () => current.current.onReset?.(),
        search: (params) => current.current.onSearch?.(params),
        tableFetched: (rows, result) => current.current.onTableFetched?.(rows, result),
        modalSuccess: (result, context) => current.current.onModalSuccess?.(result, context),
        error: (error) => current.current.onError?.(error),
        afterRender,
        resetToolbar: () => toolbar.current?.reset(false),
        openModal: (row) => modal.current?.open(row),
      },
    ),
  );
  useEffect(() => {
    if (current.current.fetchTableOnMounted !== false) void foundation.handleFetchData();
    return foundation.dispose;
  }, [foundation]);
  return { foundation, loading, toolbarModel, tableData, state: internal.current };
}
