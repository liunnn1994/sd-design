import type { ColumnFilterState } from '@sdata/web-core/table/column-filter';
import type { ColumnSorterState } from '@sdata/web-core/table/column-sorter';

import { createColumnFilterFoundation } from '@sdata/web-core/table/column-filter';
import { createColumnSorterFoundation } from '@sdata/web-core/table/column-sorter';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export function useTableColumnSorter(
  column: ColumnSorterState['column'],
  context: ColumnSorterState['context'],
) {
  const current = useRef({ column, context });
  current.current = { column, context };
  const [foundation] = useState<ReturnType<typeof createColumnSorterFoundation>>(() =>
    createColumnSorterFoundation({
      get column() {
        return current.current.column;
      },
      get context() {
        return current.current.context;
      },
      get sortOrder(): ColumnSorterState['sortOrder'] {
        return foundation.getSortOrder();
      },
      get sortDirections(): ColumnSorterState['sortDirections'] {
        return foundation.getSortDirections();
      },
      get nextSortOrder(): ColumnSorterState['nextSortOrder'] {
        return foundation.getNextSortOrder();
      },
    }),
  );
  return {
    sortOrder: foundation.getSortOrder(),
    hasSorter: foundation.hasSorter(),
    hasAscendBtn: foundation.hasAscendBtn(),
    hasDescendBtn: foundation.hasDescendBtn(),
    nextSortOrder: foundation.getNextSortOrder(),
    handleClickSorter: foundation.handleClickSorter,
  };
}

export function useTableColumnFilter(
  column: ColumnFilterState['column'],
  context: ColumnFilterState['context'],
) {
  const current = useRef({ column, context });
  current.current = { column, context };
  const [, render] = useReducer((version: number) => version + 1, 0);
  const state = useRef({
    visible: false,
    value: column.dataIndex ? (context.filters?.[column.dataIndex] ?? []) : [],
  });
  const [foundation] = useState<ReturnType<typeof createColumnFilterFoundation>>(() =>
    createColumnFilterFoundation({
      get column() {
        return current.current.column;
      },
      get context() {
        return current.current.context;
      },
      get filterValue(): string[] {
        return foundation.getFilterValue();
      },
      get filterPopupVisible() {
        return state.current.visible;
      },
      set filterPopupVisible(value) {
        state.current.visible = value;
        render();
      },
      get columnFilterValue() {
        return state.current.value;
      },
      set columnFilterValue(value) {
        state.current.value = value;
        render();
      },
    }),
  );
  const filterValue = column.dataIndex ? context.filters?.[column.dataIndex] : undefined;
  useLayoutEffect(
    () => foundation.syncFilterValue(foundation.getFilterValue()),
    [foundation, column.dataIndex, filterValue],
  );
  return {
    ...foundation,
    filterPopupVisible: state.current.visible,
    columnFilterValue: state.current.value,
    isFilterActive: foundation.isFilterActive(),
    isMultipleFilter: foundation.isMultipleFilter(),
  };
}
