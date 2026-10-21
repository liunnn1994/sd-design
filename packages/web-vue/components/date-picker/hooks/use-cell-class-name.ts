import type { CellClassNameProps } from '@sdata/web-core/date-picker/cells';
import type { Dayjs } from 'dayjs';

import { computed, toRefs } from 'vue';

import { createDateCellRangeFoundation } from '@sdata/web-core/date-picker/cell-range';
import { getDateCellClassName } from '@sdata/web-core/date-picker/cells';

import { Cell } from '../interface';

export default function useCellClassName(props: CellClassNameProps) {
  const { rangeValues } = toRefs(props);

  const foundation = createDateCellRangeFoundation({
    get rangeValues() {
      return rangeValues?.value;
    },
    get sortedRangeValues(): Array<Dayjs | undefined> | undefined {
      return sortedRangeValues.value;
    },
  });
  const sortedRangeValues = computed(foundation.getSortedRangeValues);
  const rangeStart = computed(foundation.getRangeStart);
  const rangeEnd = computed(foundation.getRangeEnd);

  return {
    getCellClassName: (cellData: Cell, disabled: boolean) =>
      getDateCellClassName(props, cellData, disabled, {
        get start() {
          return rangeStart.value;
        },
        get end() {
          return rangeEnd.value;
        },
      }),
  };
}
