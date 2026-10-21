import type { Dayjs } from 'dayjs';

export type CalendarValue = Date | string | number;
export type ValueFormat = 'timestamp' | 'Date' | string;

export interface DisabledTimeProps {
  disabledHours?: () => number[];
  disabledMinutes?: () => number[];
  disabledSeconds?: () => number[];
}

export type FormatFunc = (current: Date) => string;
export type IsSameTime = (current: Dayjs, target: Dayjs) => boolean;
export type DisabledDate = (current: Date) => boolean;
export type DisabledTime = (current: Date) => DisabledTimeProps;
export type RangeDisabledDate = (current: Date, type: 'start' | 'end') => boolean;
export type RangeDisabledTime = (current: Date, type: 'start' | 'end') => DisabledTimeProps;

export type Mode = 'date' | 'year' | 'quarter' | 'month' | 'week';

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DatePickerTriggerSlotProps {
  value: CalendarValue | undefined;
  date: Date | undefined;
  displayValue: string;
  inputValue: string | undefined;
  popupVisible: boolean;
  disabled: boolean;
  readonly: boolean;
}

export interface RangePickerTriggerSlotProps {
  value: Array<CalendarValue | undefined> | undefined;
  date: Array<Date | undefined> | undefined;
  displayValue: Array<string | undefined>;
  inputValue: Array<string | undefined> | undefined;
  popupVisible: boolean;
  disabled: boolean;
  disabledInputs: boolean[];
  readonly: boolean;
}

export interface Cell {
  value: Dayjs;
  label: string | number;
  isPrev?: boolean;
  isNext?: boolean;
  classNames?:
    | string
    | {
        [x: string]: boolean;
      };
}

export interface HeaderOperations {
  onSuperPrev?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSuperNext?: () => void;
}
