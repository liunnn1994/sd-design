import type { UnknownRecord } from 'type-fest';

import type { JsonFormProps } from '../json-form';
import type ModalComponent from '../modal/modal.vue';
import type { TableColumnData, TableData, TableInstance } from '../table';
import type { ToolbarProps } from '../toolbar';

export type MaybePromise<T> = T | Promise<T>;

export type BasicCrudTableDataResult<TData extends TableData = TableData> =
  | TData[]
  | { data: TData[]; total?: number; count?: number; [key: string]: unknown };

export type BasicCrudTableTableProps = Omit<
  TableInstance['$props'],
  'columns' | 'data' | 'onChange' | 'onPageChange' | 'onPageSizeChange'
>;

export type BasicCrudTableToolbarProps = Omit<ToolbarProps, 'loading'>;

export type BasicCrudTableModalProps = Omit<
  InstanceType<typeof ModalComponent>['$props'],
  'visible' | 'title' | 'onBeforeOk' | 'onClose' | 'onUpdate:visible'
>;

export type BasicCrudTableModalFormProps = Omit<JsonFormProps, 'model'>;

export interface BasicCrudTableProps<TRow extends TableData = TableData> {
  /** @zh 标题 @en Title */
  title?: string;
  /** @zh 表格列 @en Table columns */
  columns: TableColumnData[];
  /** @zh Table 专属属性 @en Props forwarded only to Table */
  tableProps?: BasicCrudTableTableProps;
  /** @zh Toolbar 专属属性 @en Props forwarded only to Toolbar */
  toolbarProps?: BasicCrudTableToolbarProps;
  /** @zh Modal 专属属性 @en Props forwarded only to Modal */
  modalProps?: BasicCrudTableModalProps;
  /** @zh 弹窗 JsonForm 专属属性 @en Props forwarded only to the modal JsonForm */
  modalFormProps?: BasicCrudTableModalFormProps;
  showCreate?: boolean;
  openCreateModal?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showToolbar?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  showActionColumn?: boolean;
  fetchExcludeEmptyValues?: boolean;
  fetchTableOnMounted?: boolean;
  actionWidth?: number;
  fetchTableApi?: (params: UnknownRecord) => MaybePromise<unknown>;
  tableDataTransformer?: (data: unknown) => MaybePromise<BasicCrudTableDataResult<TRow>>;
  createApi?: (data: UnknownRecord) => MaybePromise<unknown>;
  updateApi?: (data: UnknownRecord) => MaybePromise<unknown>;
  detailApi?: (row: TRow) => MaybePromise<UnknownRecord>;
  valueTransformer?: (data: UnknownRecord) => UnknownRecord;
  beforeModalSubmit?: (
    context: BasicCrudTableModalSubmitContext<TRow>,
  ) => MaybePromise<boolean | void>;
  deleteContent?: string | ((row: TRow) => MaybePromise<string>);
  deleteApi?: (row: TRow) => MaybePromise<unknown>;
  beforeDelete?: (row: TRow) => MaybePromise<boolean | void>;
  deleteNameKey?: string;
}

export type BasicCrudTableModalSubmitContext<TRow extends TableData = TableData> = {
  type: 'create' | 'edit';
  row?: TRow;
  model: UnknownRecord;
};

export type BasicCrudTableActionSlotProps<TRow extends TableData = TableData> = {
  record: TRow;
  column: TableColumnData;
  rowIndex: number;
};

export type BasicCrudTableModalSlotProps<TRow extends TableData = TableData> = {
  type: 'create' | 'edit';
  row?: TRow;
  model: UnknownRecord;
};

export type InferBasicCrudTableRowFromValue<TValue> = TValue extends readonly (infer TItem)[]
  ? TItem
  : TValue extends { data: infer TData }
    ? InferBasicCrudTableRowFromValue<TData>
    : TValue extends { results: infer TResults }
      ? InferBasicCrudTableRowFromValue<TResults>
      : never;

type AwaitedReturn<T> = T extends (...args: never[]) => infer TResult ? Awaited<TResult> : never;

export type InferBasicCrudTableRow<
  TFetchTableApi,
  TTableDataTransformer = undefined,
> = TTableDataTransformer extends (...args: never[]) => unknown
  ? InferBasicCrudTableRowFromValue<AwaitedReturn<TTableDataTransformer>>
  : InferBasicCrudTableRowFromValue<AwaitedReturn<TFetchTableApi>>;
