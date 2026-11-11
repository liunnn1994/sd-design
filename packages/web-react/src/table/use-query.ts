import type { Filters, QueryColumn, SortDirection, Sorter } from '@sdata/web-core/table/query';

import { isEqual } from '@sdata/web-core/_utils/is-equal';
import {
  createFilterFoundation,
  createSorterFoundation,
  getDefaultFilters,
  getDefaultSorter,
} from '@sdata/web-core/table/query';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export function useTableFilter(
  columns: QueryColumn[],
  onFilterChange: (field: string, values: string[]) => void,
) {
  const current = useRef({ columns, onFilterChange });
  current.current = { columns, onFilterChange };
  const defaults = useRef(getDefaultFilters(columns));
  const state = useRef<Filters>(defaults.current);
  const [, render] = useReducer((version: number) => version + 1, 0);
  const setFilters = (value: Filters) => {
    state.current = value;
    render();
  };
  const [foundation] = useState(() =>
    createFilterFoundation({
      getColumns: () => current.current.columns,
      getState: () => state.current,
      setState: setFilters,
      onFilterChange: (field, values) => current.current.onFilterChange(field, values),
    }),
  );
  useLayoutEffect(() => {
    const next = getDefaultFilters(columns);
    if (!isEqual(next, defaults.current)) {
      defaults.current = next;
      setFilters(next);
    }
  });
  return {
    get filters() {
      return foundation.getValues();
    },
    setFilters,
    resetFilters: foundation.resetFilters,
    clearFilters: foundation.clearFilters,
  };
}

export function useTableSorter(
  columns: QueryColumn[],
  onSorterChange: (field: string, direction: SortDirection) => void,
) {
  const current = useRef({ columns, onSorterChange });
  current.current = { columns, onSorterChange };
  const defaults = useRef(getDefaultSorter(columns));
  const state = useRef<Sorter | undefined>(defaults.current);
  const [, render] = useReducer((version: number) => version + 1, 0);
  const setSorter = (value: Sorter | undefined) => {
    state.current = value;
    render();
  };
  const [foundation] = useState(() =>
    createSorterFoundation({
      getColumns: () => current.current.columns,
      getState: () => state.current,
      setState: setSorter,
      onSorterChange: (field, direction) => current.current.onSorterChange(field, direction),
    }),
  );
  useLayoutEffect(() => {
    const next = getDefaultSorter(columns);
    if (!isEqual(next, defaults.current)) {
      defaults.current = next;
      setSorter(next);
    }
  });
  return {
    get sorter() {
      return foundation.getValue();
    },
    setSorter,
    resetSorters: foundation.resetSorters,
    clearSorters: foundation.clearSorters,
  };
}
