import type { Ref } from 'vue';
import { computed } from 'vue';

import { createColumnSorterFoundation } from '@sdata/web-core/table/column-sorter';

import type { TableContext } from '../context';
import type { TableColumnData } from '../interface';

export const useColumnSorter = ({
  column,
  tableCtx,
}: {
  column: Ref<TableColumnData>;
  tableCtx: Partial<TableContext>;
}) => {
  const foundation = createColumnSorterFoundation({
    get column() {
      return column.value;
    },
    get context() {
      return tableCtx;
    },
    get sortOrder() {
      return sortOrder.value;
    },
    get sortDirections() {
      return sortDirections.value;
    },
    get nextSortOrder() {
      return nextSortOrder.value;
    },
  });
  const sortOrder = computed(foundation.getSortOrder);
  const sortDirections = computed(foundation.getSortDirections);
  const hasSorter = computed(foundation.hasSorter);
  const hasAscendBtn = computed(foundation.hasAscendBtn);
  const hasDescendBtn = computed(foundation.hasDescendBtn);
  const nextSortOrder = computed(foundation.getNextSortOrder);
  const { handleClickSorter } = foundation;

  return {
    sortOrder,
    hasSorter,
    hasAscendBtn,
    hasDescendBtn,
    nextSortOrder,
    handleClickSorter,
  };
};
