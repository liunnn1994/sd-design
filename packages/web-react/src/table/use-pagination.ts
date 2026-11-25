import type { LegacyPaginationOptions } from '@sdata/web-core/pagination/legacy';

import {
  createLegacyPaginationFoundation,
  getDefaultCurrent,
  getDefaultPageSize,
} from '@sdata/web-core/pagination/legacy';
import { useReducer, useRef, useState } from 'react';

export interface TablePaginationOptions {
  pagination?: boolean | LegacyPaginationOptions;
  onPageChange?: ((page: number) => void) | undefined;
  onPageSizeChange?: ((pageSize: number) => void) | undefined;
}
export function useTablePagination(props: TablePaginationOptions) {
  const current = useRef(props);
  current.current = props;
  const [, render] = useReducer((version: number) => version + 1, 0);
  const local = useRef({
    page: getDefaultCurrent({ pagination: props.pagination }),
    pageSize: getDefaultPageSize({ pagination: props.pagination }),
  });
  const [foundation] = useState(() =>
    createLegacyPaginationFoundation(
      {
        get pagination() {
          return current.current.pagination;
        },
        get localCurrent() {
          return local.current.page;
        },
        set localCurrent(value) {
          local.current.page = value;
          render();
        },
        get localPageSize() {
          return local.current.pageSize;
        },
        set localPageSize(value) {
          local.current.pageSize = value;
          render();
        },
      },
      (event, value) => {
        if (event === 'pageChange') current.current.onPageChange?.(value);
        else current.current.onPageSizeChange?.(value);
      },
    ),
  );
  return {
    get page() {
      return foundation.getCurrent();
    },
    get pageSize() {
      return foundation.getPageSize();
    },
    handlePageChange: foundation.handlePageChange,
    handlePageSizeChange: foundation.handlePageSizeChange,
  };
}
