import { Slot, VNode } from 'vue';

import { Dayjs } from 'dayjs';

import type { FitWidthProps } from '../_hooks/use-fit-width';

import { TimePickerProps } from '../time-picker/interface';

export interface ShortcutType {
  /**
   * @zh 选项的内容
   * @en the content of shortcut
   */
  label: string | number | (() => VNode);
  /**
   * @zh 选项值
   * @en the value of shortcut
   */
  value:
    | (Date | string | number)
    | (Date | string | number)[]
    | (() => (Date | string | number) | (Date | string | number)[]);
  /**
   * @zh 解析值所使用的格式，参考[字符串解析格式](#字符串解析格式)
   * @en the format use to parse value, refer to [String Parsing Format](#string-parsing-format)
   */
  format?: string;
}

export interface DatePickerProps {
  dayStartOfWeek: WeekStart;
  format?: string | FormatFunc;
  modelValue?: CalendarValue;
  defaultValue?: CalendarValue;
  showTime: boolean;
  timePickerProps?: Partial<TimePickerProps>;
  showNowBtn: boolean;
  disabledTime?: DisabledTime;
}

export interface WeekPickerProps {
  dayStartOfWeek: WeekStart;
  format?: string;
  modelValue?: CalendarValue;
  defaultValue?: CalendarValue;
}

export interface MonthPickerProps {
  format?: string;
  modelValue?: CalendarValue;
  defaultValue?: CalendarValue;
  abbreviation?: boolean;
}

export interface YearPickerProps {
  format?: string;
  modelValue?: CalendarValue;
  defaultValue?: CalendarValue;
}

export interface QuarterPickerProps {
  format?: string;
  modelValue?: CalendarValue;
  defaultValue?: CalendarValue;
}

export interface BasePickerProps extends FitWidthProps {
  locale?: Record<string, unknown>;
  hideTrigger: boolean;
  allowClear: boolean;
  readonly: boolean;
  error: boolean;
  size: 'mini' | 'small' | 'medium' | 'large';
  shortcuts: ShortcutType[];
  shortcutsPosition: 'left' | 'bottom' | 'right';
  position: 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br';
  popupVisible: boolean | undefined;
  defaultPopupVisible: boolean;
  triggerProps?: Record<string, unknown>;
  unmountOnClose: boolean;
  inputProps?: Record<string, unknown>;
  valueFormat?: ValueFormat;
  previewShortcut: boolean;
  showConfirm?: boolean;
  hideNotInViewDates?: boolean;
  utcOffset?: number;
  timezone?: string;
}

export type PickerProps = BasePickerProps &
  DatePickerProps & {
    placeholder?: string;
    disabled: boolean;
    disabledDate?: DisabledDate;
    pickerValue?: CalendarValue;
    defaultPickerValue?: CalendarValue;
    mode: Mode;
  };

export interface RangePickerProps extends Omit<BasePickerProps, 'inputProps'> {
  mode: Mode;
  modelValue?: CalendarValue[];
  defaultValue?: CalendarValue[];
  defaultPickerValue?: CalendarValue[];
  pickerValue?: CalendarValue[];
  disabled: boolean | boolean[];
  dayStartOfWeek: WeekStart;
  format?: string;
  showTime: boolean;
  placeholder?: string[];
  timePickerProps?: Partial<TimePickerProps>;
  disabledDate?: RangeDisabledDate;
  disabledTime?: RangeDisabledTime;
  separator?: string;
  exchangeTime: boolean;
  inputProps?: Record<string, unknown>[];
  fixedTime?: boolean;
  clearRangeOnReselect?: boolean;
}

export interface HeaderIcons {
  prev?: Slot;
  prevDouble?: Slot;
  next?: Slot;
  nextDouble?: Slot;
}

export interface StartHeaderProps {
  headerValue: Dayjs;
  headerOperations: HeaderOperations;
  headerIcons: {
    prev: Slot | undefined;
    prevDouble: Slot | undefined;
    next: Slot | undefined;
    nextDouble: Slot | undefined;
  };
}

import type {
  CalendarValue,
  ValueFormat,
  FormatFunc,
  DisabledDate,
  DisabledTime,
  RangeDisabledDate,
  RangeDisabledTime,
  Mode,
  WeekStart,
  HeaderOperations,
} from '@sdata/web-core/date-picker/types';
export type * from '@sdata/web-core/date-picker/types';
