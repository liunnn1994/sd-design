import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import { createColumnFilterFoundation } from '@sdata/web-core/table/column-filter';

import type { TableContext } from '../context';
import type { TableColumnData } from '../interface';

export const useColumnFilter = ({
  column,
  tableCtx,
}: {
  column: Ref<TableColumnData>;
  tableCtx: Partial<TableContext>;
}) => {
  const foundation = createColumnFilterFoundation({
    get column() {
      return column.value;
    },
    get context() {
      return tableCtx;
    },
    get filterValue() {
      return filterValue.value;
    },
    get filterPopupVisible() {
      return filterPopupVisible.value;
    },
    set filterPopupVisible(value) {
      filterPopupVisible.value = value;
    },
    get columnFilterValue() {
      return columnFilterValue.value;
    },
    set columnFilterValue(value) {
      columnFilterValue.value = value;
    },
  });
  const filterValue = computed(foundation.getFilterValue);
  const filterPopupVisible = ref(false);
  const isFilterActive = computed(foundation.isFilterActive);
  const isMultipleFilter = computed(foundation.isMultipleFilter);
  const columnFilterValue = ref<string[]>(filterValue.value);
  watch(filterValue, foundation.syncFilterValue);
  const {
    handleFilterPopupVisibleChange,
    setFilterValue,
    handleCheckboxFilterChange,
    handleRadioFilterChange,
    handleFilterConfirm,
    handleFilterReset,
  } = foundation;

  return {
    filterPopupVisible,
    isFilterActive,
    isMultipleFilter,
    columnFilterValue,
    handleFilterPopupVisibleChange,
    setFilterValue,
    handleCheckboxFilterChange,
    handleRadioFilterChange,
    handleFilterConfirm,
    handleFilterReset,
  };
};
