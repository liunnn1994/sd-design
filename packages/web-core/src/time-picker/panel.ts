import type { Dayjs } from 'dayjs';

import { dayjs } from '../_utils/date.js';
import { isUndefined } from '../_utils/is.js';
import { isValidRangeValue } from './values.js';

export type TimeUnit = 'hour' | 'minute' | 'second' | 'ampm';

export function getSelectedTimeHour(value: Dayjs | undefined, use12Hours: boolean) {
  const hour = value?.hour();
  if (isUndefined(hour) || !use12Hours) return hour;
  if (hour > 12) return hour - 12;
  return hour === 0 ? 12 : hour;
}

export function getSelectedTimeAmpm(value: Dayjs | undefined) {
  const hour = value?.hour();
  return !isUndefined(hour) && hour >= 12 ? 'pm' : 'am';
}

export function getSelectedTime(
  current: Dayjs | undefined,
  value: number | string,
  type: TimeUnit,
  use12Hours: boolean,
) {
  const hour = getSelectedTimeHour(current, use12Hours) || '00';
  const minute = current?.minute() || '00';
  const second = current?.second() || '00';
  const ampm = getSelectedTimeAmpm(current) || 'am';
  let next;
  switch (type) {
    case 'hour':
      next = `${value}:${minute}:${second}`;
      break;
    case 'minute':
      next = `${hour}:${value}:${second}`;
      break;
    case 'second':
      next = `${hour}:${minute}:${value}`;
      break;
    case 'ampm':
      next = `${hour}:${minute}:${second} ${value}`;
      break;
  }
  let format = 'HH:mm:ss';
  if (use12Hours) {
    format = 'HH:mm:ss a';
    if (type !== 'ampm') next = `${next} ${ampm}`;
  }
  return dayjs(next, format);
}

export interface TimeRangePanelAdapter {
  getValue(): Array<Dayjs | undefined> | undefined;
  getIndex(): number;
  setIndex(index: number): void;
  onSelect(value: Array<Dayjs | undefined>): void;
  onConfirm(value: Dayjs[] | undefined): void;
  onIndexChange(index: number): void;
  onUpdateIndex(index: number): void;
}

export function createTimeRangePanel(adapter: TimeRangePanelAdapter) {
  function select(value: Dayjs) {
    const current = adapter.getValue();
    const next = isUndefined(current) ? [] : [...current];
    next[adapter.getIndex()] = value;
    adapter.onSelect(next);
  }
  function confirm() {
    const value = adapter.getValue();
    if (!isValidRangeValue(value)) {
      const next = (adapter.getIndex() + 1) % 2;
      adapter.setIndex(next);
      adapter.onIndexChange(next);
      adapter.onUpdateIndex(next);
    } else {
      adapter.onConfirm(value);
    }
  }
  return { select, confirm };
}
