import type { Filters, SortDirection, Sorter } from './query.js';

export type TableChangeType = 'pagination' | 'sorter' | 'filter' | 'drag';
export interface TableChangeState<Raw, Row> {
  readonly page: number;
  readonly pageSize: number;
  readonly sorter: Sorter | undefined;
  readonly filters: Filters;
  readonly dragTarget: Raw;
  readonly rawData: Raw[];
  readonly sortedData: Row[];
  readonly onlyCurrent: boolean;
}
export function createTableChangeFoundation<Raw, Row>(
  state: TableChangeState<Raw, Row>,
  adapter: {
    setFilters: (filters: Filters) => void;
    setSorter: (sorter: Sorter | undefined) => void;
    onFilterChange: (field: string, values: string[]) => void;
    onSorterChange: (field: string, direction: SortDirection) => void;
    onChange: (
      raw: Raw[],
      extra: {
        type: TableChangeType;
        page: number;
        pageSize: number;
        sorter: Sorter | undefined;
        filters: Filters;
        dragTarget: Raw | undefined;
      },
      sorted: Row[],
    ) => void;
    changePage: (page: number) => void;
    changePageSize: (size: number) => void;
    clearSelected: () => void;
  },
) {
  function change(type: TableChangeType) {
    const extra = {
      type,
      page: state.page,
      pageSize: state.pageSize,
      sorter: state.sorter,
      filters: state.filters,
      dragTarget: type === 'drag' ? state.dragTarget : undefined,
    };
    adapter.onChange(state.rawData, extra, state.sortedData);
  }
  function filter(field: string, values: string[]) {
    adapter.setFilters({ ...state.filters, [field]: values });
    adapter.onFilterChange(field, values);
    change('filter');
  }
  function sort(field: string, direction: SortDirection) {
    adapter.setSorter(direction ? { field, direction } : undefined);
    adapter.onSorterChange(field, direction);
    change('sorter');
  }
  function page(page: number) {
    adapter.changePage(page);
    change('pagination');
  }
  function pageSize(size: number) {
    adapter.changePageSize(size);
    change('pagination');
  }
  function pageStateChanged(current: number, previous: number) {
    if (current !== previous && state.onlyCurrent) adapter.clearSelected();
  }
  return { change, filter, sort, page, pageSize, pageStateChanged };
}
