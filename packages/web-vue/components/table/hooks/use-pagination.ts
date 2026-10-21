import { computed, ref } from 'vue';

import {
  createLegacyPaginationFoundation,
  getDefaultCurrent,
  getDefaultPageSize,
} from '@sdata/web-core/pagination/legacy';

import { TableProps } from '../interface';

export const usePagination = (
  props: Pick<TableProps, 'pagination'>,
  emit: {
    (event: 'pageChange', value: number): void;
    (event: 'pageSizeChange', value: number): void;
  },
) => {
  const paginationState = {
    get pagination() {
      return props.pagination;
    },
    get localCurrent() {
      return _page.value;
    },
    set localCurrent(value) {
      _page.value = value;
    },
    get localPageSize() {
      return _pageSize.value;
    },
    set localPageSize(value) {
      _pageSize.value = value;
    },
  };
  const _page = ref(getDefaultCurrent(paginationState));
  const _pageSize = ref(getDefaultPageSize(paginationState));
  const foundation = createLegacyPaginationFoundation(paginationState, emit);
  const pageSize = computed(foundation.getPageSize);
  const page = computed(foundation.getCurrent);
  const { handlePageChange, handlePageSizeChange } = foundation;

  return {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};
