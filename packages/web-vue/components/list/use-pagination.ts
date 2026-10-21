import { computed, ref } from 'vue';

import {
  createLegacyPaginationFoundation,
  getDefaultCurrent,
  getDefaultPageSize,
} from '@sdata/web-core/pagination/legacy';

import type { PaginationProps } from '../pagination/interface';

export const usePagination = (
  props: { paginationProps?: PaginationProps },
  { emit }: { emit: (event: string, ...args: unknown[]) => void },
) => {
  const paginationState = {
    get pagination() {
      return props.paginationProps;
    },
    get localCurrent() {
      return _current.value;
    },
    set localCurrent(value) {
      _current.value = value;
    },
    get localPageSize() {
      return _pageSize.value;
    },
    set localPageSize(value) {
      _pageSize.value = value;
    },
  };
  const _current = ref(getDefaultCurrent(paginationState));
  const _pageSize = ref(getDefaultPageSize(paginationState));
  const foundation = createLegacyPaginationFoundation(paginationState, emit);
  const current = computed(foundation.getCurrent);
  const pageSize = computed(foundation.getPageSize);
  const { handlePageChange, handlePageSizeChange } = foundation;

  return {
    current,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};
