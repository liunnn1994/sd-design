import type { DataRow } from '@sdata/web-core/table/data';
import type { Filters, SortDirection, Sorter } from '@sdata/web-core/table/query';
import type { RowKey } from '@sdata/web-core/table/selection';
import type { ScrollOptions } from '@sdata/web-core/virtual-list/types';
import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';

import type { VirtualListProps } from '../_shared/virtual-list.js';
import type { EllipsisTooltipProps } from '../ellipsis/index.js';
import type { PaginationProps } from '../pagination/types.js';
import type { ScrollbarProps } from '../scrollbar/index.js';
import type { SpinProps } from '../spin/index.js';
import type { FloatingOptions, TriggerProps } from '../trigger/index.js';

export type { Filters, SortDirection, Sorter, RowKey };
export type TableClassName = string | Record<string, boolean> | TableClassName[];
export type TableContent = ReactNode | (() => ReactNode);
export interface TableData extends Record<string, unknown> {
  key?: RowKey;
  expand?: TableContent;
  children?: TableData[];
  disabled?: boolean;
  isLeaf?: boolean;
}
export type TableDataWithRaw = DataRow<TableData>;
export interface TableSortable {
  sortDirections: Exclude<SortDirection, ''>[];
  sorter?:
    | boolean
    | ((
        a: TableData,
        b: TableData,
        extra: { dataIndex: string; direction: Sorter['direction'] },
      ) => number);
  sortOrder?: SortDirection;
  defaultSortOrder?: SortDirection;
}
export interface TableFilterSlotProps {
  filterValue: string[];
  setFilterValue(value: string[]): void;
  handleFilterConfirm(event: Event): void;
  handleFilterReset(event: Event): void;
}
export interface TableFilterData {
  text: TableContent;
  value: string;
}
export interface TableFilterable {
  filters?: TableFilterData[];
  filter(values: string[], record: TableData): boolean;
  multiple?: boolean;
  filteredValue?: string[];
  defaultFilteredValue?: string[];
  renderContent?(data: TableFilterSlotProps): ReactNode;
  icon?(): ReactNode;
  triggerProps?: Omit<TriggerProps, 'children'>;
  floatingOptions?: FloatingOptions;
  alignLeft?: boolean;
  slotName?: string;
}
export interface TableCellData {
  record: TableData;
  column: TableColumnData;
  rowIndex: number;
}
export interface TableColumnData {
  dataIndex?: string;
  title?: TableContent;
  width?: number | undefined;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
  tooltip?: boolean | EllipsisTooltipProps;
  sortable?: TableSortable;
  filterable?: TableFilterable;
  children?: TableColumnData[];
  cellClass?: TableClassName;
  headerCellClass?: TableClassName;
  bodyCellClass?: TableClassName | ((record: TableData) => TableClassName);
  summaryCellClass?: TableClassName | ((record: TableData) => TableClassName);
  cellStyle?: CSSProperties;
  headerCellStyle?: CSSProperties;
  bodyCellStyle?: CSSProperties | ((record: TableData) => CSSProperties);
  summaryCellStyle?: CSSProperties | ((record: TableData) => CSSProperties);
  render?(data: TableCellData): ReactNode;
  slotName?: string;
  titleSlotName?: string;
  slots?: {
    'cell'?(data: TableCellData): ReactNode;
    'title'?(): ReactNode;
    'filter-content'?(data: TableFilterSlotProps): ReactNode;
    'filter-icon'?(): ReactNode;
  };
  isLastLeftFixed?: boolean;
  isFirstRightFixed?: boolean;
  colSpan?: number;
  rowSpan?: number;
  index?: number;
  parent?: TableColumnData;
  _resizeWidth?: number;
}
export interface TableBorder {
  wrapper?: boolean;
  cell?: boolean;
  headerCell?: boolean;
  bodyCell?: boolean;
}
export interface TableRowSelection {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: RowKey[];
  defaultSelectedRowKeys?: RowKey[];
  showCheckedAll?: boolean;
  title?: string;
  width?: number;
  fixed?: boolean;
  checkStrictly?: boolean;
  onlyCurrent?: boolean;
}
export interface TableExpandable {
  expandedRowKeys?: RowKey[];
  defaultExpandedRowKeys?: RowKey[];
  defaultExpandAllRows?: boolean;
  expandedRowRender?(record: TableData): ReactNode;
  icon?(expanded: boolean, record: TableData): ReactNode;
  title?: string;
  width?: number;
  fixed?: boolean;
}
export interface TableDraggable {
  type?: 'handle';
  title?: string;
  width?: number;
  fixed?: boolean;
}
export type OperationName = 'selection-checkbox' | 'selection-radio' | 'expand' | 'drag-handle';
export interface TableOperationColumn {
  name: OperationName | (string & {});
  title?: TableContent;
  width?: number | undefined;
  fixed?: boolean;
  render?(record: TableData): ReactNode;
  isLastLeftFixed?: boolean;
}
export interface TableComponents {
  operations(operations: {
    dragHandle?: TableOperationColumn | undefined;
    expand?: TableOperationColumn | undefined;
    selection?: TableOperationColumn | undefined;
  }): TableOperationColumn[];
}
export interface TableChangeExtra {
  type: 'pagination' | 'sorter' | 'filter' | 'drag';
  page?: number;
  pageSize?: number;
  sorter?: Sorter | undefined;
  filters?: Filters;
  dragTarget?: TableData | undefined;
}
export const TABLE_PAGE_POSITION = ['tl', 'top', 'tr', 'bl', 'bottom', 'br'] as const;
export type TablePagePosition = (typeof TABLE_PAGE_POSITION)[number];
export type TableRowKey = string | ((record: TableData) => RowKey);
export interface TableSpanMethodContext {
  record: TableData;
  column: TableColumnData | TableOperationColumn;
  rowIndex: number;
  columnIndex: number;
}
export type TableSpanMethod = (
  data: TableSpanMethodContext,
) => { rowspan?: number; colspan?: number } | void;
export type TableLoadMore = (record: TableData, done: (children?: TableData[]) => void) => void;
export interface TableSummaryContext {
  columns: TableColumnData[];
  data: TableData[];
}
export type TableSummary = boolean | ((params: TableSummaryContext) => TableData[]);
export type TableSummarySpanMethod = TableSpanMethod;
export interface TableInstance {
  selectAll(checked?: boolean): void;
  select(keys: RowKey | RowKey[], checked?: boolean): void;
  expandAll(expanded?: boolean): void;
  expand(keys: RowKey | RowKey[], expanded?: boolean): void;
  resetFilters(fields?: string | string[]): void;
  clearFilters(fields?: string | string[]): void;
  resetSorters(): void;
  clearSorters(): void;
  scrollIntoView(options: ScrollOptions): void;
}
export interface TableRowRenderData {
  rowIndex?: number | undefined;
  record?: TableData | undefined;
}
export interface TableProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect' | 'children' | 'draggable'
> {
  ref?: Ref<TableInstance>;
  columns?: TableColumnData[];
  data?: TableData[];
  children?: ReactNode;
  bordered?: boolean | TableBorder;
  hoverable?: boolean;
  stripe?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large';
  tableLayoutFixed?: boolean;
  loading?: boolean | SpinProps;
  spinProps?: SpinProps;
  rowSelection?: TableRowSelection;
  expandable?: TableExpandable;
  scroll?:
    | {
        x?: number | string;
        y?: number | string;
        minWidth?: number | string;
        maxHeight?: number | string;
      }
    | undefined;
  pagination?: boolean | Partial<PaginationProps>;
  pagePosition?: TablePagePosition;
  indentSize?: number;
  rowKey?: TableRowKey;
  showHeader?: boolean;
  virtualListProps?: Omit<VirtualListProps<TableDataWithRaw>, 'items' | 'children'>;
  spanMethod?: TableSpanMethod;
  spanAll?: boolean;
  components?: TableComponents;
  loadMore?: TableLoadMore;
  filterIconAlignLeft?: boolean;
  hideExpandButtonOnEmpty?: boolean;
  rowClass?: TableClassName | ((record: TableData, rowIndex: number) => TableClassName);
  draggable?: TableDraggable;
  rowNumber?: boolean | Record<string, unknown>;
  columnResizable?: boolean;
  summary?: TableSummary;
  summaryText?: string;
  summarySpanMethod?: TableSpanMethod;
  selectedKeys?: RowKey[];
  defaultSelectedKeys?: RowKey[];
  expandedKeys?: RowKey[];
  defaultExpandedKeys?: RowKey[];
  defaultExpandAllRows?: boolean;
  stickyHeader?: boolean | number;
  scrollbar?: boolean | ScrollbarProps;
  showEmptyTree?: boolean;
  onSelectedKeysChange?(keys: RowKey[]): void;
  onExpandedKeysChange?(keys: RowKey[]): void;
  onExpand?(key: RowKey, record: TableData): void;
  onExpandedChange?(keys: RowKey[]): void;
  onSelect?(keys: RowKey[], key: RowKey, record: TableData): void;
  onSelectAll?(checked: boolean): void;
  onSelectionChange?(keys: RowKey[]): void;
  onSorterChange?(field: string, direction: SortDirection): void;
  onFilterChange?(field: string, values: string[]): void;
  onPageChange?(page: number): void;
  onPageSizeChange?(size: number): void;
  onChange?(data: TableData[], extra: TableChangeExtra, currentData: TableDataWithRaw[]): void;
  onCellMouseEnter?(record: TableData, column: TableColumnData, event: Event): void;
  onCellMouseLeave?(record: TableData, column: TableColumnData, event: Event): void;
  onCellClick?(record: TableData, column: TableColumnData, event: Event): void;
  onRowClick?(record: TableData, event: Event): void;
  onHeaderClick?(column: TableColumnData, event: Event): void;
  onColumnResize?(field: string, width: number): void;
  onRowDblclick?(record: TableData, event: Event): void;
  onCellDblclick?(record: TableData, column: TableColumnData, event: Event): void;
  onRowContextmenu?(record: TableData, event: Event): void;
  onCellContextmenu?(record: TableData, column: TableColumnData, event: Event): void;
  renderExpandIcon?(data: { expanded: boolean; record: TableData }): ReactNode;
  renderExpandRow?(data: { record: TableData }): ReactNode;
  footer?: ReactNode;
  dragHandleIcon?: ReactNode;
  paginationLeft?: ReactNode;
  paginationRight?: ReactNode;
  renderSummaryCell?(data: TableCellData): ReactNode;
  empty?: ReactNode;
  theadComponent?: ElementType;
  tbodyComponent?: ElementType;
  trComponent?: ElementType;
  tdComponent?: ElementType;
  thComponent?: ElementType;
  renderContent?(): ReactNode;
  renderThead?(): ReactElement;
  renderTbody?(): ReactElement;
  renderTr?(data: TableRowRenderData): ReactElement;
  renderTh?(data: { column: TableColumnData }): ReactElement;
  renderTd?(data: TableCellData): ReactElement;
  titleSlots?: Record<string, (data: { column: TableColumnData }) => ReactNode>;
  cellSlots?: Record<string, (data: TableCellData) => ReactNode>;
  filterSlots?: Record<string, (data: TableFilterSlotProps) => ReactNode>;
}
