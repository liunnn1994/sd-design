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
  sorter?: Sorter | undefined;
  filters?: Filters;
  filterIconAlignLeft?: boolean;
  resizingColumn?: string;
  onSorterChange?(field: string, direction: SortDirection, event: Event): void;
  onFilterChange?(field: string, values: string[], event: Event): void;
  onThMouseDown?(field: string, event: MouseEvent): void;
  titleSlots?: Record<string, (data: { column: TableColumnData }) => ReactNode> | undefined;
  filterSlots?: Record<string, (data: TableFilterSlotProps) => ReactNode> | undefined;
  cellSlots?: Record<string, (data: TableCellData) => ReactNode> | undefined;
  loadMore?: TableLoadMore | undefined;
  addLazyLoadData?(children: TableData[] | undefined, row: TableDataWithRaw): void;
  onSelectAll?(checked: boolean): void;
}
export const TableContext = createContext<TableContextValue>({});
