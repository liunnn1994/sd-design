import { isFunction } from '../_utils/is.js';
import { getLeafKeys, getSelectionStatus, type SelectionNode, type RowKey } from './selection.js';
export interface TableCellRecord<Raw> {
  readonly raw: Raw;
  readonly isLeaf?: boolean | undefined;
  readonly children?: unknown;
}
export interface TableCellLoadingState<Row> {
  isLoading: boolean;
  readonly record: Row;
}
export interface TableCellLoadingContext<Raw, Row> {
  loadMore?: ((record: Raw, done: (children?: Raw[]) => void) => void) | undefined;
  addLazyLoadData?: ((children: Raw[] | undefined, record: Row) => void) | undefined;
}
export function createTableCellLoadingFoundation<Raw, Row extends TableCellRecord<Raw>>(
  state: TableCellLoadingState<Row>,
  tableCtx: TableCellLoadingContext<Raw, Row>,
) {
  function handleClick(event: Event) {
    if (
      !state.isLoading &&
      isFunction(tableCtx.loadMore) &&
      !state.record?.isLeaf &&
      !state.record?.children
    ) {
      state.isLoading = true;
      new Promise<Raw[] | undefined>((resolve) => {
        tableCtx.loadMore?.(state.record.raw, resolve);
      }).then((children) => {
        tableCtx.addLazyLoadData?.(children, state.record);
        state.isLoading = false;
      });
    }
    event.stopPropagation();
  }
  return { handleClick };
}
export interface TableSelectionContext<Row> {
  readonly currentSelectedRowKeys?: RowKey[] | undefined;
  readonly currentAllEnabledRowKeys?: RowKey[] | undefined;
  readonly checkStrictly?: boolean | undefined;
  onSelectAllLeafs?: ((record: Row, checked: boolean) => void) | undefined;
  onSelect?: ((checked: boolean, record: Row) => void) | undefined;
}
export interface TableOperationProps<Row> {
  readonly record: Row;
  readonly selectedRowKeys?: RowKey[] | undefined;
}
export interface TableOperationCachedState {
  readonly leafKeys: RowKey[];
  readonly selectionStatus: { checked: boolean; indeterminate: boolean };
  readonly isTreeSelection: boolean;
}
export function getTableHeaderCheckboxStatus(
  tableCtx: Pick<
    TableSelectionContext<unknown>,
    'currentSelectedRowKeys' | 'currentAllEnabledRowKeys'
  >,
) {
  let checked = false;
  let indeterminate = false;

  const currentSelectedEnabledRowKeys =
    tableCtx.currentSelectedRowKeys?.filter(
      (key) => tableCtx.currentAllEnabledRowKeys?.includes(key) ?? true,
    ) ?? [];

  const selectedNumber = currentSelectedEnabledRowKeys.length;
  const totalEnabledNumber = tableCtx.currentAllEnabledRowKeys?.length ?? 0;
  if (selectedNumber > 0) {
    if (selectedNumber >= totalEnabledNumber) {
      checked = true;
    } else {
      indeterminate = true;
    }
  }
  return {
    checked,
    indeterminate,
  };
}
export function createTableOperationFoundation<Row extends SelectionNode>(
  props: TableOperationProps<Row>,
  tableCtx: TableSelectionContext<Row>,
  state: TableOperationCachedState,
) {
  const getEnabledLeafKeys = () =>
    getLeafKeys(props.record).filter(
      (key) => tableCtx.currentAllEnabledRowKeys?.includes(key) ?? true,
    );
  const getCurrentSelectionStatus = () =>
    getSelectionStatus(tableCtx.currentSelectedRowKeys ?? [], state.leafKeys);
  const getIsTreeSelection = () => !tableCtx.checkStrictly && !props.record.isLeaf;
  const getCheckboxValue = () =>
    state.isTreeSelection
      ? state.selectionStatus.checked
      : (props.selectedRowKeys?.includes(props.record.key) ?? false);
  const handleCheckboxChange = (checked: unknown) => {
    if (state.isTreeSelection) {
      tableCtx.onSelectAllLeafs?.(props.record, checked as boolean);
    } else {
      tableCtx.onSelect?.(checked as boolean, props.record);
    }
  };
  const handleRadioChange = (checked: unknown) => {
    tableCtx.onSelect?.(checked as boolean, props.record);
  };
  return {
    getEnabledLeafKeys,
    getCurrentSelectionStatus,
    getIsTreeSelection,
    getCheckboxValue,
    handleCheckboxChange,
    handleRadioChange,
  };
}
