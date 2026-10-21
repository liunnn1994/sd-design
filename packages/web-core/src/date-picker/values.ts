import type { Dayjs } from 'dayjs';

import type { CalendarValue, ValueFormat } from './types.js';

import { getDayjsValue, toLocal } from '../_utils/date.js';
import { isFunction } from '../_utils/is.js';
import { normalizeRangeValue } from './utils.js';

export interface DateShortcutValue {
  value: CalendarValue | CalendarValue[] | (() => CalendarValue | CalendarValue[]);
  format?: string;
}

export function getInitialDateValue<T>(
  model: T | undefined,
  getDefault: () => T | undefined,
  empty: T,
): T {
  if (model !== undefined) return model;
  const value = getDefault();
  return value === undefined ? empty : value;
}
export function getDateShortcutValue(
  shortcut: DateShortcutValue,
  format: string,
  utcOffset?: number,
  timezone?: string,
) {
  const { value } = shortcut;
  return getDayjsValue(
    (isFunction(value) ? value() : value) as CalendarValue,
    shortcut.format || format,
    utcOffset,
    timezone,
  );
}
export function getRangeDateShortcutValue(
  shortcut: DateShortcutValue,
  format: string,
  utcOffset?: number,
  timezone?: string,
) {
  return getDayjsValue(
    normalizeRangeValue(
      isFunction(shortcut.value) ? shortcut.value() : shortcut.value,
    ) as CalendarValue[],
    shortcut.format || format,
    utcOffset,
    timezone,
  );
}

export function getReturnValue(
  date: Dayjs,
  format: ValueFormat,
  utcOffset?: number,
  timezone?: string,
) {
  const localDate = toLocal(date, utcOffset, timezone);

  if (format === 'timestamp') {
    return localDate.toDate().getTime();
  }
  if (format === 'Date') {
    return localDate.toDate();
  }
  return localDate.format(format);
}

export function getReturnRangeValue(
  dates: Dayjs[],
  format: ValueFormat,
  utcOffset?: number,
  timezone?: string,
): CalendarValue[];
export function getReturnRangeValue(
  dates: (Dayjs | undefined)[],
  format: ValueFormat,
  utcOffset?: number,
  timezone?: string,
): (CalendarValue | undefined)[];
export function getReturnRangeValue(
  dates: (Dayjs | undefined)[],
  format: ValueFormat,
  utcOffset?: number,
  timezone?: string,
) {
  return dates.map((date) =>
    date ? getReturnValue(date, format, utcOffset, timezone) : undefined,
  );
}
