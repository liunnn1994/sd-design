import type { UnknownRecord } from 'type-fest';

import type { ButtonProps } from '../button';
import type { JsonFormProps } from '../json-form';
import type { LinkProps } from '../link';
import type ModalComponent from '../modal/modal.vue';
import type { SpinProps } from '../spin';
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

export type BasicCrudTableToolbarProps = Omit<ToolbarProps, 'loading' | 'searchBtn' | 'resetBtn'>;

export type BasicCrudTableModalProps = Omit<
  InstanceType<typeof ModalComponent>['$props'],
  'visible' | 'title' | 'onBeforeOk' | 'onClose' | 'onUpdate:visible'
>;

export type BasicCrudTableModalFormProps = Omit<JsonFormProps, 'model'>;

export type BasicCrudTableRowLinkProps<TRow extends TableData = TableData> =
  | LinkProps
  | ((row: TRow) => LinkProps);

export interface BasicCrudTableProps<TRow extends TableData = TableData> {
  /**
   * @zh 标题
   * @en Title
   */
  title?: string;
  /**
   * @zh 表格列
   * @en Table columns
   */
  columns: TableColumnData[];
  /**
   * @zh Table 专属属性
   * @en Props forwarded only to Table
   */
  tableProps?: BasicCrudTableTableProps;
  /**
   * @zh Toolbar 专属属性
   * @en Props forwarded only to Toolbar
   */
  toolbarProps?: BasicCrudTableToolbarProps;
  /**
   * @zh 查询按钮属性
   * @en Props of the search button
   */
  searchBtn?: ButtonProps;
  /**
   * @zh 重置按钮属性
   * @en Props of the reset button
   */
  resetBtn?: ButtonProps;
  /**
   * @zh 新建按钮属性
   * @en Props of the create button
   */
  createBtn?: ButtonProps;
  /**
   * @zh 编辑按钮属性
   * @en Props of the edit button
   */
  editBtn?: BasicCrudTableRowLinkProps<TRow>;
  /**
   * @zh 删除按钮属性
   * @en Props of the delete button
   */
  deleteBtn?: BasicCrudTableRowLinkProps<TRow>;
  /**
   * @zh 加载遮罩 Spin 的属性
   * @en Props passed to the loading overlay Spin
   */
  spinProps?: SpinProps;
  /**
   * @zh Modal 专属属性
   * @en Props forwarded only to Modal
   */
  modalProps?: BasicCrudTableModalProps;
  /**
   * @zh 弹窗 JsonForm 专属属性
   * @en Props forwarded only to the modal JsonForm
   */
  modalFormProps?: BasicCrudTableModalFormProps;
  /**
   * @zh 是否占满父级高度，并让表格区域滚动
   * @en Whether to fill the parent height and scroll the table area
   */
  fullHeight?: boolean;
  /**
   * @zh 是否显示新建按钮
   * @en Whether to show the create button
   */
  showCreate?: boolean;
  /**
   * @zh 点击新建按钮时是否打开新建弹窗
   * @en Whether to open the create modal when the create button is clicked
   */
  openCreateModal?: boolean;
  /**
   * @zh 是否显示编辑操作
   * @en Whether to show the edit action
   */
  showEdit?: boolean;
  /**
   * @zh 是否显示删除操作
   * @en Whether to show the delete action
   */
  showDelete?: boolean;
  /**
   * @zh 是否显示工具栏
   * @en Whether to show the toolbar
   */
  showToolbar?: boolean;
  /**
   * @zh 是否显示表头
   * @en Whether to show the table header
   */
  showHeader?: boolean;
  /**
   * @zh 是否显示标题
   * @en Whether to show the title
   */
  showTitle?: boolean;
  /**
   * @zh 是否显示操作列
   * @en Whether to show the action column
   */
  showActionColumn?: boolean;
  /**
   * @zh 请求表格数据时是否剔除空值参数
   * @en Whether to drop empty values from the table request params
   */
  fetchExcludeEmptyValues?: boolean;
  /**
   * @zh 挂载后是否自动请求表格数据
   * @en Whether to fetch table data on mount
   */
  fetchTableOnMounted?: boolean;
  /**
   * @zh 操作列宽度（像素）
   * @en Width of the action column in pixels
   */
  actionWidth?: number;
  /**
   * @zh 请求表格数据的接口
   * @en API used to fetch table data
   */
  fetchTableApi?: (params: UnknownRecord) => MaybePromise<unknown>;
  /**
   * @zh 表格数据的转换函数
   * @en Function used to transform the fetched table data
   */
  tableDataTransformer?: (data: unknown) => MaybePromise<BasicCrudTableDataResult<TRow>>;
  /**
   * @zh 新建数据的接口
   * @en API used to create a record
   */
  createApi?: (data: UnknownRecord) => MaybePromise<unknown>;
  /**
   * @zh 更新数据的接口
   * @en API used to update a record
   */
  updateApi?: (data: UnknownRecord) => MaybePromise<unknown>;
  /**
   * @zh 获取单条详情的接口
   * @en API used to fetch a record detail
   */
  detailApi?: (row: TRow) => MaybePromise<UnknownRecord>;
  /**
   * @zh 提交前对表单数据的转换
   * @en Transform applied to the form data before submitting
   */
  valueTransformer?: (data: UnknownRecord) => UnknownRecord;
  /**
   * @zh 弹窗提交前的钩子，返回 false 可阻止提交
   * @en Hook run before the modal submits; return false to block it
   */
  beforeModalSubmit?: (
    context: BasicCrudTableModalSubmitContext<TRow>,
  ) => MaybePromise<boolean | void>;
  /**
   * @zh 删除确认文案
   * @en Confirmation text shown before deleting
   */
  deleteContent?: string | ((row: TRow) => MaybePromise<string>);
  /**
   * @zh 删除数据的接口
   * @en API used to delete a record
   */
  deleteApi?: (row: TRow) => MaybePromise<unknown>;
  /**
   * @zh 删除前的钩子，返回 false 可阻止删除
   * @en Hook run before deleting; return false to block it
   */
  beforeDelete?: (row: TRow) => MaybePromise<boolean | void>;
  /**
   * @zh 删除确认文案中用于取名称的字段
   * @en Field used to read the record name in the confirmation text
   */
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
