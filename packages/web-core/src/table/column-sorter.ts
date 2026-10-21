import {
  getNextSortOrder as resolveNextSortOrder,
  type SortDirection,
  type Sorter,
} from './query.js';
export interface ColumnSorterState {
  readonly column: {
    dataIndex?: string | undefined;
    sortable?: { sortDirections?: Exclude<SortDirection, ''>[] | undefined } | undefined;
  };
  readonly context: {
    sorter?: Sorter | undefined;
    onSorterChange?: ((field: string, direction: SortDirection, event: Event) => void) | undefined;
  };
  readonly sortOrder: SortDirection | undefined;
  readonly sortDirections: Exclude<SortDirection, ''>[];
  readonly nextSortOrder: SortDirection;
}
export function createColumnSorterFoundation(state: ColumnSorterState) {
  const getSortOrder = () => {
    if (state.column.dataIndex && state.column.dataIndex === state.context.sorter?.field) {
      return state.context.sorter.direction;
    }
    return undefined;
  };
  const getSortDirections = () => state.column?.sortable?.sortDirections ?? [];
  const hasSorter = () => state.sortDirections.length > 0;
  const hasAscendBtn = () => state.sortDirections.includes('ascend');
  const hasDescendBtn = () => state.sortDirections.includes('descend');
  const getNextSortOrder = () => resolveNextSortOrder(state.sortOrder, state.sortDirections);
  const handleClickSorter = (ev: Event) => {
    if (state.column.dataIndex) {
      state.context.onSorterChange?.(state.column.dataIndex, state.nextSortOrder, ev);
    }
  };
  return {
    getSortOrder,
    getSortDirections,
    hasSorter,
    hasAscendBtn,
    hasDescendBtn,
    getNextSortOrder,
    handleClickSorter,
  };
}
