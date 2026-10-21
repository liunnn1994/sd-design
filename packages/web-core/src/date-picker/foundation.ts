import type { Dayjs } from 'dayjs';

import type { CalendarValue, Mode } from './types.js';

import { getNow, getDayjsValue, getDateValue, isValueChange, toLocal } from '../_utils/date.js';
import { isBoolean } from '../_utils/is.js';
import { getFormattedValue, isValidInputValue } from '../time-picker/values.js';
import { mergeValueWithTime } from './utils.js';
import { getReturnValue as returnValue } from './values.js';

export type DateHeaderMode = 'year' | 'month' | undefined;
type ValueEvent = (
  value: CalendarValue | undefined,
  date: Date | undefined,
  formatted: string | undefined,
) => void;
export interface DatePickerAdapter<S> {
  getSelectedValue(): Dayjs | undefined;
  getPanelValue(): Dayjs | undefined;
  getHeaderValue(): Dayjs;
  getTimeValue(): Dayjs;
  getFormat(): string;
  getParseFormat(): string;
  getReturnFormat(): string;
  getUtcOffset(): number | undefined;
  getTimezone(): string | undefined;
  getMode(): Mode;
  getHeaderMode(): DateHeaderMode;
  getVisible(): boolean;
  getDisabled(): boolean;
  getReadonly(): boolean;
  getIsDateTime(): boolean;
  getHasTimePickerProps(): boolean;
  getNeedConfirm(): boolean;
  setSelectedValue(value: Dayjs | undefined): void;
  setProcessValue(value: Dayjs | undefined): void;
  setPreviewValue(value: Dayjs | undefined): void;
  setInputValue(value: string | undefined): void;
  setHeaderValue(value: Dayjs): void;
  setHeaderMode(value: DateHeaderMode): void;
  setVisible(visible: boolean): void;
  resetHeaderValue(): void;
  resetTimeValue(): void;
  isDisabledDate(value: Dayjs | undefined): boolean | undefined;
  onUpdateValue(value: CalendarValue | undefined): void;
  onChange: ValueEvent;
  onSelect: ValueEvent;
  onOk: ValueEvent;
  onClear(): void;
  onShortcut(shortcut: S): void;
  onFormChange(): void;
  onPopupChange(visible: boolean): void;
  onUpdatePopup(visible: boolean): void;
  cancelPreviewClear(): void;
  schedulePreviewClear(task: () => void): void;
}

export function createDatePickerFoundation<S>(adapter: DatePickerAdapter<S>) {
  function onModelChange() {
    adapter.setProcessValue(undefined);
    adapter.setPreviewValue(undefined);
    adapter.setInputValue(undefined);
  }
  function onVisibilityChange(visible: boolean) {
    adapter.setProcessValue(undefined);
    adapter.setPreviewValue(undefined);
    adapter.setHeaderMode(undefined);
    if (visible) {
      adapter.resetHeaderValue();
      adapter.resetTimeValue();
    }
    if (!visible) adapter.setInputValue(undefined);
  }
  const getReturnValue = (value: Dayjs) =>
    returnValue(value, adapter.getReturnFormat(), adapter.getUtcOffset(), adapter.getTimezone());
  function setPanelVisible(newVisible: boolean) {
    if (adapter.getVisible() !== newVisible) {
      adapter.setVisible(newVisible);
      adapter.onPopupChange(newVisible);
      adapter.onUpdatePopup(newVisible);
    }
  }
  function emitChange(value: Dayjs | undefined, emitOk?: boolean) {
    const localValue = value
      ? toLocal(value, adapter.getUtcOffset(), adapter.getTimezone())
      : undefined;
    const returnValue = value ? getReturnValue(value) : undefined;
    const formattedValue = getFormattedValue(localValue, adapter.getParseFormat());
    const dateValue = getDateValue(localValue);
    if (isValueChange(value, adapter.getSelectedValue())) {
      adapter.onUpdateValue(returnValue);
      adapter.onChange(returnValue, dateValue, formattedValue);
      adapter.onFormChange();
    }

    if (emitOk) {
      adapter.onOk(returnValue, dateValue, formattedValue);
    }
  }

  function confirm(value: Dayjs | undefined, showPanel?: boolean, emitOk?: boolean) {
    if (adapter.getDisabled() || adapter.getReadonly() || adapter.isDisabledDate(value)) {
      return;
    }

    emitChange(value, emitOk);
    adapter.setSelectedValue(value);
    adapter.setProcessValue(undefined);
    adapter.setPreviewValue(undefined);
    adapter.setInputValue(undefined);
    adapter.setHeaderMode(undefined);
    if (isBoolean(showPanel)) {
      setPanelVisible(showPanel);
    }
  }

  function select(value: Dayjs | undefined, emitSelect?: boolean) {
    if (adapter.getDisabled() || adapter.getReadonly()) return;
    adapter.setProcessValue(value);
    adapter.setPreviewValue(undefined);
    adapter.setInputValue(undefined);
    adapter.setHeaderMode(undefined);

    if (emitSelect) {
      const returnValue = value ? getReturnValue(value) : undefined;
      const localValue = value
        ? toLocal(value, adapter.getUtcOffset(), adapter.getTimezone())
        : undefined;
      const formattedValue = getFormattedValue(localValue, adapter.getParseFormat());
      const dateValue = getDateValue(localValue);
      adapter.onSelect(returnValue, dateValue, formattedValue);
    }
  }

  function getMergedOpValue(date: Dayjs, time?: Dayjs) {
    if (!adapter.getIsDateTime() && !adapter.getHasTimePickerProps()) return date;
    return mergeValueWithTime(getNow(adapter.getUtcOffset(), adapter.getTimezone()), date, time);
  }

  function onPanelVisibleChange(visible: boolean) {
    if (adapter.getDisabled()) return;
    setPanelVisible(visible);
  }

  function onInputClear() {
    confirm(undefined);
    adapter.onClear();
  }

  function onInputChange(targetValue: string) {
    setPanelVisible(true);

    adapter.setInputValue(targetValue);

    if (!isValidInputValue(targetValue, adapter.getFormat())) return;

    const newValue = getDayjsValue(
      targetValue,
      adapter.getFormat(),
      adapter.getUtcOffset(),
      adapter.getTimezone(),
    ) as Dayjs;

    if (adapter.isDisabledDate(newValue)) return;

    if (adapter.getNeedConfirm()) {
      select(newValue);
    } else {
      confirm(newValue, true);
    }
  }

  function onInputPressEnter() {
    confirm(adapter.getPanelValue(), false);
  }

  function onPanelSelect(value: Dayjs) {
    if (adapter.getNeedConfirm()) {
      select(value, true);
    } else {
      confirm(value, false);
    }
  }

  function onPanelCellClick(value: Dayjs) {
    const newValue = getMergedOpValue(value, adapter.getTimeValue());
    onPanelSelect(newValue);
  }

  function onTimePickerSelect(time: Dayjs) {
    const newValue = getMergedOpValue(adapter.getPanelValue() || getNow(), time);
    onPanelSelect(newValue);
  }

  function onPanelConfirm() {
    confirm(adapter.getPanelValue(), false, true);
  }

  function onPanelShortcutMouseEnter(value: Dayjs) {
    if (adapter.getDisabled() || adapter.getReadonly()) return;
    adapter.cancelPreviewClear();
    adapter.setPreviewValue(value);
    adapter.setInputValue(undefined);
  }

  function onPanelShortcutMouseLeave() {
    adapter.cancelPreviewClear();
    adapter.schedulePreviewClear(() => {
      adapter.setPreviewValue(undefined);
    });
  }

  function onPanelShortcutClick(value: Dayjs, shortcut: S) {
    if (adapter.getDisabled() || adapter.getReadonly()) return;
    adapter.onShortcut(shortcut);
    confirm(value, false);
  }

  function onPanelHeaderLabelClick(type: 'year' | 'month') {
    adapter.setHeaderMode(type);
  }

  function onMonthHeaderClick() {
    adapter.setHeaderMode('year');
  }

  function onPanelHeaderSelect(date: Dayjs) {
    let newValue = adapter.getHeaderValue();
    newValue = newValue.set('year', date.year());
    if (adapter.getHeaderMode() === 'month') {
      newValue = newValue.set('month', date.month());
    }
    adapter.setHeaderValue(newValue);
    if (adapter.getMode() === 'quarter' || adapter.getMode() === 'month') {
      // 季度选择器特殊处理，月份选完后关闭headerMode
      adapter.setHeaderMode(undefined);
      return;
    }
    adapter.setHeaderMode(adapter.getHeaderMode() === 'year' ? 'month' : undefined); // 年选择完后选择月
  }

  return {
    onModelChange,
    onVisibilityChange,
    onPanelVisibleChange,
    onInputClear,
    onInputChange,
    onInputPressEnter,
    onPanelCellClick,
    onTimePickerSelect,
    onPanelConfirm,
    onPanelSelect,
    onPanelShortcutMouseEnter,
    onPanelShortcutMouseLeave,
    onPanelShortcutClick,
    onPanelHeaderLabelClick,
    onMonthHeaderClick,
    onPanelHeaderSelect,
  };
}
