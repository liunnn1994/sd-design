import { isString } from '../_utils/is.js';

export type SortDirection = 'ascend' | 'descend' | '';
export type Sorter = { field: string; direction: Exclude<SortDirection, ''> };
export type Filters = Record<string, string[]>;

/** Query rules do not consume framework renderers or column slots. */
export interface QueryColumn {
  dataIndex?: string;
  sortable?: { sortOrder?: SortDirection; defaultSortOrder?: SortDirection };
  filterable?: { filteredValue?: string[]; defaultFilteredValue?: string[] };
}

export function getDefaultFilters(columns: QueryColumn[]): Filters {
  const filters: Filters = Object.create(null);
  for (const item of columns) {
    if (item.dataIndex && item.filterable?.defaultFilteredValue) {
      filters[item.dataIndex] = item.filterable.defaultFilteredValue;
    }
  }
  return filters;
}

export function createFilterFoundation(adapter: {
  getColumns: () => QueryColumn[];
  getState: () => Filters;
  setState: (filters: Filters) => void;
  onFilterChange: (field: string, values: string[]) => void;
}) {
  function getValues(): Filters {
    const filters: Filters = Object.create(null);
    for (const item of adapter.getColumns()) {
      if (item.dataIndex) {
        const value = item.filterable?.filteredValue ?? adapter.getState()[item.dataIndex];
        if (value) filters[item.dataIndex] = value;
      }
    }
    return filters;
  }

  function changeFilters(reset: boolean, dataIndex?: string | string[]) {
    const fields = dataIndex ? ([] as string[]).concat(dataIndex) : [];
    const filters: Filters = fields.length > 0 ? { ...adapter.getState() } : Object.create(null);
    for (const item of adapter.getColumns()) {
      if (
        item.dataIndex &&
        item.filterable &&
        (fields.length === 0 || fields.includes(item.dataIndex))
      ) {
        const value = reset ? (item.filterable.defaultFilteredValue ?? []) : [];
        filters[item.dataIndex] = value;
        adapter.onFilterChange(item.dataIndex, value);
      }
    }
    // Keep the existing notification-before-commit order, including callbacks
    // that update controlled state while a reset is in progress.
    adapter.setState(filters);
  }

  return {
    getValues,
    resetFilters: (field?: string | string[]) => changeFilters(true, field),
    clearFilters: (field?: string | string[]) => changeFilters(false, field),
  };
}

export function getDefaultSorter(columns: QueryColumn[]): Sorter | undefined {
  for (const item of columns) {
    if (item.dataIndex && item.sortable?.defaultSortOrder) {
      return { field: item.dataIndex, direction: item.sortable.defaultSortOrder };
    }
  }
  return undefined;
}

export function createSorterFoundation(adapter: {
  getColumns: () => QueryColumn[];
  getState: () => Sorter | undefined;
  setState: (sorter: Sorter | undefined) => void;
  onSorterChange: (field: string, direction: SortDirection) => void;
}) {
  function getValue(): Sorter | undefined {
    for (const item of adapter.getColumns()) {
      if (item.dataIndex && item.sortable) {
        const state = adapter.getState();
        const direction = isString(item.sortable.sortOrder)
          ? item.sortable.sortOrder
          : state?.field === item.dataIndex
            ? state.direction
            : '';
        if (direction) return { field: item.dataIndex, direction };
      }
    }
    return undefined;
  }
  function resetSorters() {
    let sorter: Sorter | undefined;
    for (const item of adapter.getColumns()) {
      if (item.dataIndex && item.sortable) {
        if (!sorter && item.sortable.defaultSortOrder) {
          sorter = { field: item.dataIndex, direction: item.sortable.defaultSortOrder };
        }
        adapter.onSorterChange(item.dataIndex, item.sortable.defaultSortOrder ?? '');
      }
    }
    adapter.setState(sorter);
  }
  function clearSorters() {
    for (const item of adapter.getColumns()) {
      if (item.dataIndex && item.sortable) adapter.onSorterChange(item.dataIndex, '');
    }
  }
  return { getValue, resetSorters, clearSorters };
}

export function getNextSortOrder(
  current: SortDirection | undefined,
  directions: Exclude<SortDirection, ''>[],
): SortDirection {
  if (!current) return directions[0] ?? '';
  if (current === directions[0]) return directions[1] ?? '';
  return '';
}
