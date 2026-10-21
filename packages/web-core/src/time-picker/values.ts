import { Dayjs } from 'dayjs';

import type { BasePanelProps } from './types.js';

import { dayjs } from '../_utils/date.js';
import { isArray, isUndefined, isDayjs } from '../_utils/is.js';

export function getColumnsFromFormat(format: string) {
  const tokens = format.replace(/\[[^\]]*]/g, '');
  const units = ['H', 'h', 'm', 's', 'a', 'A'];
  const list: string[] = [];
  let use12Hours = false;
  units.forEach((unit) => {
    if (tokens.indexOf(unit) !== -1) {
      list.push(unit);
      if (unit === 'a' || unit === 'A') {
        use12Hours = true;
      }
    }
  });
  return {
    list,
    use12Hours,
  };
}

export function resolveTimeFormat(format?: string, defaultFormat?: string, use12Hours?: boolean) {
  const value = format || defaultFormat;
  return !value || !getColumnsFromFormat(value).list.length
    ? use12Hours
      ? 'hh:mm:ss a'
      : 'HH:mm:ss'
    : value;
}

export function isDisabledTimeValue(
  value: Dayjs | Array<Dayjs | undefined> | undefined,
  options: Parameters<typeof isDisabledTime>[1],
) {
  return isArray(value)
    ? value.some((item) => isDisabledTime(item, options))
    : isDisabledTime(value, options);
}

export function getFormattedValue(time: Dayjs, format: string): string;
export function getFormattedValue(time: Dayjs | undefined, format: string): string | undefined;
export function getFormattedValue(
  time: Array<Dayjs | undefined> | undefined,
  format: string,
): Array<string | undefined> | undefined;
export function getFormattedValue(
  time: Dayjs | Array<Dayjs | undefined> | undefined,
  format: string,
): string | Array<string | undefined> | undefined;
export function getFormattedValue(
  time: Dayjs | Array<Dayjs | undefined> | undefined,
  format: string,
): string | Array<string | undefined> | undefined {
  const formatValue = (
    time: Dayjs | Array<Dayjs | undefined> | undefined,
  ): string | Array<string | undefined> | undefined => {
    if (isArray(time)) {
      return time.map((t) => formatValue(t)) as Array<string | undefined>;
    }

    if (isUndefined(time)) return undefined;

    return time.format(format);
  };

  return formatValue(time);
}

export function isValidRangeValue(value: unknown): value is undefined | Dayjs[] {
  if (isUndefined(value)) return true;
  if (!isArray(value)) return false;
  return value.length === 0 || (value.length === 2 && isDayjs(value[0]) && isDayjs(value[1]));
}

export function isValidInputValue(time: string, format: string): boolean {
  if (!time) return false;

  return typeof time === 'string' && dayjs(time, format).format(format) === time;
}

export function isDisabledTime(
  value: Dayjs | undefined,
  {
    disabledHours,
    disabledMinutes,
    disabledSeconds,
  }: {
    disabledHours: BasePanelProps['disabledHours'];
    disabledMinutes: BasePanelProps['disabledMinutes'];
    disabledSeconds: BasePanelProps['disabledSeconds'];
  },
) {
  if (!value) return false;

  const hour = value.hour();
  const minute = value.minute();
  const second = value.second();

  const disabledHourList = disabledHours?.() || [];
  const disabledMinuteList = disabledMinutes?.(hour) || [];
  const disabledSecondList = disabledSeconds?.(hour, minute) || [];

  const isDisabledItem = (num: number | undefined, disabledList: number[]) => {
    return !isUndefined(num) && disabledList.includes(num);
  };

  return (
    isDisabledItem(hour, disabledHourList) ||
    isDisabledItem(minute, disabledMinuteList) ||
    isDisabledItem(second, disabledSecondList)
  );
}
