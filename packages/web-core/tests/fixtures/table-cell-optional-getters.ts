import {
  createTableCellLoadingFoundation,
  createTableOperationFoundation,
  type TableCellLoadingContext,
  type TableSelectionContext,
} from '../../dist/table/cell.js';

const context: TableCellLoadingContext<number, { raw: number }> = {
  get loadMore() {
    return undefined;
  },
  get addLazyLoadData() {
    return undefined;
  },
};
createTableCellLoadingFoundation(
  {
    isLoading: false,
    record: {
      raw: 0,
      get isLeaf() {
        return undefined;
      },
    },
  },
  context,
);

const selection: TableSelectionContext<{ key: number }> = {
  get onSelectAllLeafs() {
    return undefined;
  },
  get onSelect() {
    return undefined;
  },
};
createTableOperationFoundation({ record: { key: 0 } }, selection, {
  leafKeys: [],
  selectionStatus: { checked: false, indeterminate: false },
  isTreeSelection: false,
});
