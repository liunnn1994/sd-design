import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import { createFilterFoundation, getDefaultFilters } from '@sdata/web-core/table/query';

import type { Filters, TableColumnData } from '../interface';

import { isEqual } from '../../_utils/is-equal';

export const useFilter = ({
  columns,
  onFilterChange,
}: {
  columns: Ref<TableColumnData[]>;
  onFilterChange: (dataIndex: string, filteredValues: string[]) => void;
}) => {
  const _filters = ref<Filters>(getDefaultFilters(columns.value));

  watch(
    () => getDefaultFilters(columns.value),
    (defaults, previousDefaults) => {
      if (!isEqual(defaults, previousDefaults)) {
        _filters.value = defaults;
      }
    },
  );

  const foundation = createFilterFoundation({
    getColumns: () => columns.value,
    getState: () => _filters.value,
    setState: (value) => {
      _filters.value = value;
    },
    onFilterChange,
  });
  const computedFilters = computed<Filters>(() => foundation.getValues());

  return {
    _filters,
    computedFilters,
    resetFilters: foundation.resetFilters,
    clearFilters: foundation.clearFilters,
  };
};
