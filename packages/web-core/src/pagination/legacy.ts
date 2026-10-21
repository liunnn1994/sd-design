import { isObject } from '../_utils/is.js';

export interface LegacyPaginationOptions {
  defaultCurrent?: number | undefined;
  defaultPageSize?: number | undefined;
  current?: number | undefined;
  pageSize?: number | undefined;
}
export interface LegacyPaginationState {
  readonly pagination: boolean | LegacyPaginationOptions | undefined;
  localCurrent: number;
  localPageSize: number;
}
export const getDefaultCurrent = (state: Pick<LegacyPaginationState, 'pagination'>) =>
  isObject(state.pagination) ? (state.pagination.defaultCurrent ?? 1) : 1;
export const getDefaultPageSize = (state: Pick<LegacyPaginationState, 'pagination'>) =>
  isObject(state.pagination) ? (state.pagination.defaultPageSize ?? 10) : 10;

export function createLegacyPaginationFoundation(
  state: LegacyPaginationState,
  emit: {
    (event: 'pageChange', value: number): void;
    (event: 'pageSizeChange', value: number): void;
  },
) {
  const getCurrent = () =>
    isObject(state.pagination)
      ? (state.pagination.current ?? state.localCurrent)
      : state.localCurrent;
  const getPageSize = () =>
    isObject(state.pagination)
      ? (state.pagination.pageSize ?? state.localPageSize)
      : state.localPageSize;
  const handlePageChange = (page: number) => {
    state.localCurrent = page;
    emit('pageChange', page);
  };
  const handlePageSizeChange = (pageSize: number) => {
    state.localPageSize = pageSize;
    emit('pageSizeChange', pageSize);
  };
  return { getCurrent, getPageSize, handlePageChange, handlePageSizeChange };
}
