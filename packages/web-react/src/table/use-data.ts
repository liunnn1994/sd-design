import type { TableDragState } from '@sdata/web-core/table/drag';

import {
  collectRawKeys,
  collectRowKeys,
  filterRows,
  mapRawTableData,
  pageRows,
  processRows,
  sortRows,
  reorderRows,
} from '@sdata/web-core/table/data';
import { useReducer, useRef, useState } from 'react';

import type {
  Filters,
  RowKey,
  Sorter,
  TableColumnData,
  TableData,
  TableDataWithRaw,
  TableRowKey,
} from './types.js';

export interface TableDataOptions {
  data: TableData[];
  rowKey: TableRowKey;
  columns: Map<string, TableColumnData>;
  filters: Filters;
  sorter?: Sorter | undefined;
  page: number;
  pageSize: number;
  pagination: boolean;
  loadMore: boolean;
  hideExpandButtonOnEmpty: boolean;
  dragState?: Pick<TableDragState, 'committing' | 'sourcePath' | 'targetPath'>;
}
export function useTableData(props: TableDataOptions) {
  const current = useRef(props);
  current.current = props;
  const [lazyLoadData] = useState(() => new Map<RowKey, TableData[]>());
  const [, render] = useReducer((version: number) => version + 1, 0);
  const getFilteredData = () => {
    const value = current.current;
    const rows = processRows(value.data, {
      rowKey: value.rowKey,
      loadMore: value.loadMore,
      hideExpandButtonOnEmpty: value.hideExpandButtonOnEmpty,
      lazyLoadData,
    });
    return filterRows(rows, value.filters, value.columns);
  };
  const getSortedData = () => {
    const sorted = sortRows(getFilteredData(), current.current.sorter, current.current.columns);
    const drag = current.current.dragState;
    return drag?.committing ? reorderRows(sorted, drag.sourcePath, drag.targetPath) : sorted;
  };
  const getPageData = () =>
    pageRows(
      getSortedData(),
      current.current.page,
      current.current.pageSize,
      current.current.pagination,
    );
  const rows = getPageData();
  return {
    rows,
    rawRows: mapRawTableData(rows),
    allRowKeys: collectRawKeys(props.data, props.rowKey),
    currentAllRowKeys: collectRowKeys(rows),
    currentAllEnabledRowKeys: collectRowKeys(rows, true),
    getSortedData,
    getFilteredData,
    getPageData,
    addLazyLoadData(children: TableData[] | undefined, record: TableDataWithRaw) {
      if (children) {
        lazyLoadData.set(record.key, children);
        render();
      }
    },
  };
}
