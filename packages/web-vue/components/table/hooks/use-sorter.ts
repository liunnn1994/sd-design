import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import { createSorterFoundation, getDefaultSorter } from '@sdata/web-core/table/query';

import type { Sorter, TableColumnData } from '../interface';

import { isEqual } from '../../_utils/is-equal';

export const useSorter = ({
  columns,
  onSorterChange,
}: {
  columns: Ref<TableColumnData[]>;
  onSorterChange: (dataIndex: string, direction: 'ascend' | 'descend' | '') => void;
}) => {
  const _sorter = ref<Sorter | undefined>(getDefaultSorter(columns.value));

  watch(
    () => getDefaultSorter(columns.value),
    (defaults, previousDefaults) => {
      if (!isEqual(defaults, previousDefaults)) {
        _sorter.value = defaults;
      }
    },
  );

  const foundation = createSorterFoundation({
    getColumns: () => columns.value,
    getState: () => _sorter.value,
    setState: (value) => {
      _sorter.value = value;
    },
    onSorterChange,
  });
  const computedSorter = computed<Sorter | undefined>(() => foundation.getValue());

  return {
    _sorter,
    computedSorter,
    resetSorters: foundation.resetSorters,
    clearSorters: foundation.clearSorters,
  };
};
