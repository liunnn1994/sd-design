import type { TableSelectionContext } from '@sdata/web-core/table/cell';
import type { ReactNode } from 'react';

import { createContext } from 'react';

import type {
  Filters,
  SortDirection,
  Sorter,
  TableColumnData,
  TableCellData,
  TableData,
  TableDataWithRaw,
  TableLoadMore,
  TableFilterSlotProps,
} from './types.js';

export interface TableContextValue extends TableSelectionContext<TableDataWithRaw> {
  sorter?: Sorter;
  filters?: Filters;
  filterIconAlignLeft?: boolean;
  resizingColumn?: string;
  onSorterChange?(field: string, direction: SortDirection, event: Event): void;
  onFilterChange?(field: string, values: string[], event: Event): void;
  onThMouseDown?(field: string, event: MouseEvent): void;
  titleSlots?: Record<string, (data: { column: TableColumnData }) => ReactNode>;
  filterSlots?: Record<string, (data: TableFilterSlotProps) => ReactNode>;
  cellSlots?: Record<string, (data: TableCellData) => ReactNode>;
  loadMore?: TableLoadMore;
  addLazyLoadData?(children: TableData[] | undefined, row: TableDataWithRaw): void;
  onSelectAll?(checked: boolean): void;
}
export const TableContext = createContext<TableContextValue>({});
