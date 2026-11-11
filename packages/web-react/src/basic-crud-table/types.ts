import type { BasicCrudTableModalSubmitContext } from '@sdata/web-core/basic-crud-table/types';
import type { CSSProperties, ReactNode, Ref } from 'react';
import type { UnknownRecord } from 'type-fest';

import type { ButtonProps } from '../button/index.js';
import type { JsonFormProps } from '../json-form/index.js';
import type { LinkProps } from '../link/index.js';
import type { ModalProps } from '../modal/index.js';
import type { SpinProps } from '../spin/index.js';
import type { TableProps, TableData, TableColumnData, TableCellData } from '../table/index.js';
import type { ToolbarProps } from '../toolbar/index.js';
import type { CrudModalInstance } from './modal.js';
import type { CrudTableOptions } from './use-table.js';

export type * from '@sdata/web-core/basic-crud-table/types';
export type BasicCrudTableTableProps = Omit<
  TableProps,
  'columns' | 'data' | 'onChange' | 'onPageChange' | 'onPageSizeChange'
>;
export type BasicCrudTableToolbarProps = Omit<ToolbarProps, 'loading' | 'searchBtn' | 'resetBtn'>;
export type BasicCrudTableModalProps = Omit<
  ModalProps,
  'visible' | 'title' | 'onBeforeOk' | 'onClose' | 'onVisibleChange'
>;
export type BasicCrudTableModalFormProps = Omit<
  JsonFormProps,
  'model' | 'value' | 'modelValue' | 'ref'
>;
export type BasicCrudTableRowLinkProps<Row extends TableData = TableData> =
  | LinkProps
  | ((row: Row) => LinkProps);
export type BasicCrudTableActionSlotProps<Row extends TableData = TableData> = Omit<
  TableCellData,
  'record'
> & { record: Row };
export type BasicCrudTableModalSlotProps<Row extends TableData = TableData> =
  BasicCrudTableModalSubmitContext<Row>;
export interface BasicCrudTableProps<Row extends TableData = TableData> extends Omit<
  CrudTableOptions<Row>,
  'pagination' | 'defaultPageSize'
> {
  ref?: Ref<BasicCrudTableInstance<Row>>;
  className?: string;
  style?: CSSProperties;
  title?: string;
  columns: TableColumnData[];
  tableProps?: BasicCrudTableTableProps;
  toolbarProps?: BasicCrudTableToolbarProps;
  searchBtn?: ButtonProps;
  resetBtn?: ButtonProps;
  createBtn?: ButtonProps;
  editBtn?: BasicCrudTableRowLinkProps<Row>;
  deleteBtn?: BasicCrudTableRowLinkProps<Row>;
  spinProps?: SpinProps;
  modalProps?: BasicCrudTableModalProps;
  modalFormProps?: BasicCrudTableModalFormProps;
  fullHeight?: boolean;
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showToolbar?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  showActionColumn?: boolean;
  actionWidth?: number;
  createApi?: (data: UnknownRecord) => unknown | Promise<unknown>;
  updateApi?: (data: UnknownRecord) => unknown | Promise<unknown>;
  detailApi?: (row: Row) => UnknownRecord | Promise<UnknownRecord>;
  valueTransformer?: (data: UnknownRecord) => UnknownRecord;
  beforeModalSubmit?: (
    context: BasicCrudTableModalSubmitContext<Row>,
  ) => boolean | void | Promise<boolean | void>;
  deleteNameKey?: string;
  modalModel?: UnknownRecord;
  defaultModalModel?: UnknownRecord;
  onModalModelChange?(model: UnknownRecord): void;
  modalVisible?: boolean;
  onModalVisibleChange?(visible: boolean): void;
  onModalClose?(): void;
  slots?: Record<string, (data: Record<string, unknown>) => ReactNode>;
}
export interface BasicCrudTableInstance<Row extends TableData = TableData> {
  fetchTableData(params?: UnknownRecord): Promise<void>;
  search(): Promise<void>;
  reset(): Promise<void>;
  resetToolbar(): void;
  resetTable(): Promise<void>;
  create(): void;
  edit(row: Row, context?: unknown): Promise<void>;
  delete(row: Row, context?: unknown): Promise<boolean>;
  readonly tableData: Row[];
  readonly fetchData: unknown;
  readonly isCreate: boolean;
  readonly modalRef: CrudModalInstance<Row> | null;
}
