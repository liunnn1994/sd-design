import type { Dayjs } from 'dayjs';

import type { HeaderOperations, Mode } from './types.js';

import { getSortedDayjsArray, methods } from '../_utils/date.js';

export function getPanelSpan(mode: Mode) {
  return { date: 1, week: 1, year: 10 * 12, quarter: 12, month: 12 }[mode];
}
export function getPanelSuperSpan(mode: Mode) {
  return mode === 'year' ? 10 * 12 : 12;
}
export function getHeaderUnit(mode: Mode) {
  return mode === 'date' || mode === 'week' ? 'M' : 'y';
}

export function getSelectedHeaderValue(
  header: Dayjs,
  selected: Dayjs,
  mode: 'year' | 'month' | undefined,
) {
  let value = header.set('year', selected.year());
  if (mode === 'month') value = value.set('month', selected.month());
  return value;
}

export interface DateHeaderAdapter {
  readonly mode: Mode;
  readonly value: Dayjs;
  readonly span: number;
  readonly superSpan: number;
  setLocalValue(value: Dayjs): void;
  onChange(value: Dayjs): void;
}

export function createDateHeader(adapter: DateHeaderAdapter) {
  function setValue(value: Dayjs | undefined, emitChange = true) {
    if (!value) return;
    if (emitChange && !adapter.value.isSame(value, getHeaderUnit(adapter.mode))) {
      adapter.onChange(value);
    }
    adapter.setLocalValue(value);
  }
  function getOperations(): HeaderOperations {
    const canMovePrev = (months: number) =>
      methods.subtract(adapter.value, months, 'M').year() >= 0;
    const single = adapter.span !== adapter.superSpan;
    return {
      onSuperPrev: canMovePrev(adapter.superSpan)
        ? () => setValue(methods.subtract(adapter.value, adapter.superSpan, 'M'))
        : undefined,
      onPrev:
        single && canMovePrev(adapter.span)
          ? () => setValue(methods.subtract(adapter.value, adapter.span, 'M'))
          : undefined,
      onNext: single ? () => setValue(methods.add(adapter.value, adapter.span, 'M')) : undefined,
      onSuperNext: () => setValue(methods.add(adapter.value, adapter.superSpan, 'M')),
    };
  }
  return { setValue, getOperations };
}

export function fixRangeHeaders(values: Dayjs[], span: number, mode: Mode) {
  const sorted = getSortedDayjsArray(values);
  const start = sorted[0];
  const next = methods.add(start, span, 'M');
  return [start, sorted[1].isBefore(next, getHeaderUnit(mode)) ? next : sorted[1]];
}

export function sortSelectedRangeHeaders(values: Array<Dayjs | undefined>) {
  let [start, end] = values;
  if (start && end) [start, end] = getSortedDayjsArray([start, end]);
  return [start, end];
}

export function canShortenRangeHeaders(start: Dayjs, end: Dayjs, span: number, mode: Mode) {
  return methods.add(start, span, 'M').isBefore(end, getHeaderUnit(mode));
}

export function rangeHeaderOperationKeys(mode: Mode, month: boolean, year: boolean, end: boolean) {
  const date = mode === 'date' || mode === 'week';
  const keys: Array<keyof HeaderOperations> = [end ? 'onSuperNext' : 'onSuperPrev'];
  if (date) keys.push(end ? 'onNext' : 'onPrev');
  if (month && date) keys.push(end ? 'onPrev' : 'onNext');
  if (year) keys.push(end ? 'onSuperPrev' : 'onSuperNext');
  return keys;
}

export interface DateRangeHeaderAdapter {
  readonly mode: Mode;
  readonly start: Dayjs;
  readonly end: Dayjs;
  setStart(value: Dayjs, emit: boolean): void;
  setEnd(value: Dayjs, emit: boolean): void;
  onChange(value: Dayjs[]): void;
}
export function setDateRangeHeader(adapter: DateRangeHeaderAdapter, value: Dayjs[]) {
  const sameStart = adapter.start.isSame(value[0], getHeaderUnit(adapter.mode));
  const sameEnd = adapter.end.isSame(value[1], getHeaderUnit(adapter.mode));
  adapter.setStart(value[0], false);
  adapter.setEnd(value[1], false);
  if (!sameStart || !sameEnd) adapter.onChange(value);
}

export interface DatePanelHeaderLabelState {
  readonly mode: Mode;
  readonly value?: Pick<Dayjs, 'format'> | undefined;
}
export function createDatePanelHeaderLabels(
  props: DatePanelHeaderLabelState,
  datePickerT: (key: string) => unknown,
) {
  const getLocaleFormat = (key: string, defaultFormat: string) => {
    const format = datePickerT(key);
    return typeof format === 'string' && format !== key ? format : defaultFormat;
  };
  const getYear = () =>
    ['date', 'quarter', 'month', 'week'].includes(props.mode) && props.value
      ? props.value.format(getLocaleFormat('datePicker.yearFormat', 'YYYY'))
      : '';
  const getMonth = () =>
    ['date', 'week'].includes(props.mode) && props.value
      ? props.value.format(getLocaleFormat('datePicker.monthFormat', 'MM'))
      : '';
  return { getYear, getMonth };
}
