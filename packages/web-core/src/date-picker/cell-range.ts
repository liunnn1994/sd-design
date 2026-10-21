import type { Dayjs } from 'dayjs';

import { getSortedDayjsArray } from '../_utils/date.js';
import { isDayjs } from '../_utils/is.js';

export interface DateCellRangeState {
  readonly rangeValues: Array<Dayjs | undefined> | undefined;
  readonly sortedRangeValues: Array<Dayjs | undefined> | undefined;
}
export function createDateCellRangeFoundation(state: DateCellRangeState) {
  const getSortedRangeValues = () =>
    state.rangeValues && state.rangeValues.every(isDayjs)
      ? getSortedDayjsArray(state.rangeValues)
      : state.rangeValues;
  const getRangeStart = () => state.sortedRangeValues?.[0];
  const getRangeEnd = () => state.sortedRangeValues?.[1];
  return { getSortedRangeValues, getRangeStart, getRangeEnd };
}
