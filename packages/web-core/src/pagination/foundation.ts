import type { PageDescriptor } from './types.js';

import { isNumber } from '../_utils/is.js';

export interface PaginationAdapter {
  readonly current: number;
  readonly pageSize: number;
  readonly controlledPageSize: number | undefined;
  readonly pages: number;
  readonly baseSize: number;
  readonly bufferSize: number;
  readonly autoAdjust: boolean | undefined;
  readonly disabled: boolean;
  setCurrent(value: number): void;
  setPageSize(value: number): void;
  onCurrent(value: number): void;
  onPageSize(value: number): void;
}
export function createPaginationFoundation(adapter: PaginationAdapter) {
  const handleClick = (page: number) => {
    if (page !== adapter.current && isNumber(page) && !adapter.disabled) {
      adapter.setCurrent(page);
      adapter.onCurrent(page);
    }
  };
  const handlePageSizeChange = (pageSize: number) => {
    const oldPageSize = adapter.pageSize;
    adapter.setPageSize(pageSize);
    adapter.onPageSize(pageSize);
    // autoAdjust：保持当前页首项在新页长下仍可见（如 100 条每页 10 第 3 页 → 每页 20 时落到第 2 页）
    if (
      adapter.controlledPageSize === undefined &&
      adapter.autoAdjust &&
      isNumber(adapter.current) &&
      oldPageSize !== pageSize &&
      oldPageSize > 0
    ) {
      const firstItem = (adapter.current - 1) * oldPageSize + 1;
      const newCurrent = Math.floor((firstItem - 1) / pageSize) + 1;
      if (newCurrent !== adapter.current && newCurrent >= 1 && newCurrent <= adapter.pages) {
        adapter.setCurrent(newCurrent);
        adapter.onCurrent(newCurrent);
      }
    }
  };

  function getPageList(): PageDescriptor[] {
    const items: PageDescriptor[] = [];
    const baseSize = adapter.baseSize;
    const bufferSize = adapter.bufferSize;
    if (adapter.pages < baseSize + bufferSize * 2) {
      for (let page = 1; page <= adapter.pages; page++)
        items.push({ key: page, type: 'page', pageNumber: page });
      return items;
    }
    let left = 1;
    let right = adapter.pages;
    let hasLeftEllipsis = false;
    let hasRightEllipsis = false;
    if (adapter.current > 2 + bufferSize) {
      hasLeftEllipsis = true;
      left = Math.min(adapter.current - bufferSize, adapter.pages - 2 * bufferSize);
    }
    if (adapter.current < adapter.pages - (bufferSize + 1)) {
      hasRightEllipsis = true;
      right = Math.max(adapter.current + bufferSize, 2 * bufferSize + 1);
    }
    if (hasLeftEllipsis) {
      items.push({ key: 1, type: 'page', pageNumber: 1 });
      items.push({ key: 'left-ellipsis-pager', type: 'more', step: -(bufferSize * 2 + 1) });
    }
    for (let page = left; page <= right; page++)
      items.push({ key: page, type: 'page', pageNumber: page });
    if (hasRightEllipsis) {
      items.push({ key: 'right-ellipsis-pager', type: 'more', step: bufferSize * 2 + 1 });
      items.push({ key: adapter.pages, type: 'page', pageNumber: adapter.pages });
    }
    return items;
  }
  function sync(
    currentPageSize: number,
    currentPages: number,
    previousPageSize: number,
    previousPages: number,
  ) {
    if (!adapter.autoAdjust || adapter.current <= 1) return;

    let newCurrent = adapter.current;
    if (adapter.controlledPageSize !== undefined && currentPageSize !== previousPageSize) {
      const index = previousPageSize * (adapter.current - 1) + 1;
      newCurrent = Math.max(1, Math.min(Math.ceil(index / currentPageSize), currentPages));
    } else if (currentPages !== previousPages && adapter.current > currentPages) {
      newCurrent = Math.max(currentPages, 1);
    }
    if (newCurrent !== adapter.current) {
      adapter.setCurrent(newCurrent);
      adapter.onCurrent(newCurrent);
    }
  }
  return { change: handleClick, changePageSize: handlePageSizeChange, getPageList, sync };
}
