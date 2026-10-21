import { computed, Ref } from 'vue';

import { computeTableSpans } from '@sdata/web-core/table/span';

import { TableColumnData, TableData, TableDataWithRaw, TableOperationColumn } from '../interface';

export const useSpan = ({
  spanMethod,
  data,
  columns,
}: {
  spanMethod: Ref<
    | ((data: {
        record: TableData;
        column: TableColumnData | TableOperationColumn;
        rowIndex: number;
        columnIndex: number;
      }) => { rowspan?: number; colspan?: number } | void)
    | undefined
  >;
  data: Ref<TableDataWithRaw[]>;
  columns: Ref<(TableColumnData | TableOperationColumn)[]>;
}) => {
  const state = computed(() => computeTableSpans(data.value, columns.value, spanMethod.value));
  const tableSpan = computed(() => state.value.tableSpan);
  const removedCells = computed(() => state.value.removedCells);
  return { tableSpan, removedCells };
};
