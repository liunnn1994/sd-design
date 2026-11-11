import type { PickerInputInstance } from '../_shared/picker-input.js';
import type { PickerProps } from './picker.js';
import type { RangePickerProps } from './range-picker.js';

import { Picker } from './picker.js';
import { RangePicker } from './range-picker.js';

export type { PickerProps, RangePickerProps };
export type { DatePickerShortcut as ShortcutType } from './panel-shortcuts.js';
export type {
  CalendarValue,
  ValueFormat,
  FormatFunc,
  DisabledDate,
  DisabledTime,
  DisabledTimeProps,
  RangeDisabledDate,
  RangeDisabledTime,
  DatePickerTriggerSlotProps,
  RangePickerTriggerSlotProps,
  WeekStart,
} from '@sdata/web-core/date-picker/types';
export type { DatePickerChangeHandler } from './use-date-picker.js';
export type DatePickerSelectHandler = NonNullable<PickerProps['onSelect']>;
export type DatePickerOkHandler = NonNullable<PickerProps['onOk']>;
export type RangePickerChangeHandler = NonNullable<RangePickerProps['onChange']>;
export type RangePickerSelectHandler = NonNullable<RangePickerProps['onSelect']>;
export type RangePickerOkHandler = NonNullable<RangePickerProps['onOk']>;
export type DatePickerProps = Omit<PickerProps, 'mode'>;
export type WeekPickerProps = DatePickerProps;
export type MonthPickerProps = DatePickerProps;
export type QuarterPickerProps = DatePickerProps;
export type YearPickerProps = DatePickerProps;
export type DatePickerInstance = PickerInputInstance;
export type WeekPickerInstance = PickerInputInstance;
export type MonthPickerInstance = PickerInputInstance;
export type QuarterPickerInstance = PickerInputInstance;
export type YearPickerInstance = PickerInputInstance;
export type RangePickerInstance = PickerInputInstance;

export function WeekPicker(props: WeekPickerProps) {
  return <Picker {...props} mode="week" />;
}
export function MonthPicker(props: MonthPickerProps) {
  return <Picker {...props} mode="month" />;
}
export function QuarterPicker(props: QuarterPickerProps) {
  return <Picker {...props} mode="quarter" />;
}
export function YearPicker(props: YearPickerProps) {
  return <Picker {...props} mode="year" />;
}
function DatePickerRoot(props: DatePickerProps) {
  return <Picker {...props} mode="date" />;
}
export const DatePicker = Object.assign(DatePickerRoot, {
  WeekPicker,
  MonthPicker,
  QuarterPicker,
  YearPicker,
  RangePicker,
});
export { RangePicker };
export default DatePicker;
