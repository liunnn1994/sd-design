import type { Filters } from './query.js';

import { isEqual } from '../_utils/is-equal.js';
import { isArray } from '../_utils/is.js';

export interface ColumnFilterState {
  readonly column: {
    dataIndex?: string | undefined;
    filterable?: { multiple?: boolean | undefined } | undefined;
  };
  readonly context: {
    filters?: Filters | undefined;
    onFilterChange?: ((field: string, values: string[], event: Event) => void) | undefined;
  };
  readonly filterValue: string[];
  filterPopupVisible: boolean;
  columnFilterValue: string[];
}
export function createColumnFilterFoundation(state: ColumnFilterState) {
  const getFilterValue = () => {
    if (state.column.dataIndex && state.context.filters?.[state.column.dataIndex]) {
      return state.context.filters[state.column.dataIndex];
    }
    return [];
  };
  const isFilterActive = () => state.filterValue.length > 0;
  const isMultipleFilter = () => Boolean(state.column.filterable?.multiple);
  function syncFilterValue(value: string[]) {
    if (isArray(value) && !isEqual(value, state.columnFilterValue)) {
      state.columnFilterValue = value;
    }
  }
  const handleFilterPopupVisibleChange = (value: boolean) => {
    state.filterPopupVisible = value;
  };
  const setFilterValue = (filterValue: string[]) => {
    state.columnFilterValue = filterValue;
  };
  const handleCheckboxFilterChange = (values: string[]) => {
    setFilterValue(values);
  };
  const handleRadioFilterChange = (value: string) => {
    setFilterValue([value]);
  };
  const handleFilterConfirm = (ev: Event) => {
    if (state.column.dataIndex) {
      state.context.onFilterChange?.(state.column.dataIndex, state.columnFilterValue, ev);
    }
    handleFilterPopupVisibleChange(false);
  };
  const handleFilterReset = (ev: Event) => {
    setFilterValue([]);
    if (state.column.dataIndex) {
      state.context.onFilterChange?.(state.column.dataIndex, state.columnFilterValue, ev);
    }
    handleFilterPopupVisibleChange(false);
  };
  return {
    getFilterValue,
    isFilterActive,
    isMultipleFilter,
    syncFilterValue,
    handleFilterPopupVisibleChange,
    setFilterValue,
    handleCheckboxFilterChange,
    handleRadioFilterChange,
    handleFilterConfirm,
    handleFilterReset,
  };
}
