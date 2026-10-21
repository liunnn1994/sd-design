import type { Dayjs } from 'dayjs';

import type {
  DisabledDate,
  DisabledTime,
  RangeDisabledDate,
  RangeDisabledTime,
  Mode,
} from './types.js';

import { getDateValue } from '../_utils/date.js';
import { isDisabledDate } from './utils.js';

export interface DateDisabledOptions {
  mode?: Mode;
  showTime?: boolean;
  disabledDate?: DisabledDate | RangeDisabledDate;
  disabledTime?: DisabledTime | RangeDisabledTime;
  isRange?: boolean;
}

export function isDatePickerDisabled(
  value: Dayjs | undefined,
  options: DateDisabledOptions,
  type: 'start' | 'end' = 'start',
) {
  if (!value) return value;
  const disabledDate = options.disabledDate;
  if (
    disabledDate &&
    isDisabledDate(
      value,
      options.isRange
        ? (date) => (options.disabledDate as RangeDisabledDate)(date, type)
        : (disabledDate as DisabledDate),
      options.mode,
    )
  )
    return true;
  if (options.mode !== 'date' || !options.showTime || !options.disabledTime) return false;
  const date = getDateValue(value);
  const disabled = options.isRange
    ? (options.disabledTime as RangeDisabledTime)(date, type)
    : (options.disabledTime as DisabledTime)(date);
  const contains = (number: number, list?: () => number[]) => (list?.() || []).includes(number);
  return (
    contains(value.hour(), disabled.disabledHours) ||
    contains(value.minute(), disabled.disabledMinutes) ||
    contains(value.second(), disabled.disabledSeconds)
  );
}
