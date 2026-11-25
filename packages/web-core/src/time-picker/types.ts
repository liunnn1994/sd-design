import { Dayjs } from 'dayjs';

// 支持：Date ｜ 字符串 ｜ 时间戳
export type TimeValue = Date | string | number;

export interface TimePickerTriggerSlotProps {
  value: string | Array<string | undefined> | undefined;
  date: Date | Array<Date | undefined> | undefined;
  displayValue: string | Array<string | undefined>;
  inputValue: string | Array<string | undefined> | undefined;
  popupVisible: boolean;
  disabled: boolean;
  readonly: boolean;
  range: boolean;
}

export interface BasePanelProps {
  disableConfirm: boolean;
  use12Hours: boolean;
  step?: { hour?: number; minute?: number; second?: number } | undefined;
  disabledHours?: (() => number[]) | undefined;
  disabledMinutes?: ((selectedHour?: number) => number[]) | undefined;
  disabledSeconds?: ((selectedHour?: number, selectedMinute?: number) => number[]) | undefined;
  hideDisabledOptions: boolean;
}

export interface PanelProps extends Omit<BasePanelProps, 'disableConfirm'> {
  value?: Dayjs | undefined;
  defaultValue?: Dayjs;
  format: string;
  visible: boolean;
  hideFooter: boolean;
  isRange: boolean;
  disabled: boolean;
}

export interface RangePanelProps extends Omit<PanelProps, 'value'> {
  value?: Array<Dayjs | undefined>;
}

export interface TimeListItem {
  value: number | string;
  label: string;
  disabled?: boolean | undefined;
  selected?: boolean;
}

export type TimeList = TimeListItem[];
