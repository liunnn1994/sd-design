import type { Dayjs } from 'dayjs';

import { dayjs, getSortedDayjsArray, isValueChange, getDateValue } from '../_utils/date.js';
import { isArray } from '../_utils/is.js';
import { getFormattedValue, isValidInputValue, isValidRangeValue } from './values.js';

export type TimeStateValue = Dayjs | Array<Dayjs | undefined> | undefined;
export type TimeInputValue = string | Array<string | undefined> | undefined;
export type TimeDateValue = Date | Array<Date | undefined> | undefined;
export interface TimePickerAdapter {
  getValue(): TimeStateValue;
  getPanelValue(): TimeStateValue;
  getInputValue(): TimeInputValue;
  getFormat(): string;
  getVisible(): boolean;
  getDisabled(): boolean;
  getReadonly(): boolean;
  getDisableConfirm(): boolean;
  getRange(): boolean;
  getFocusedIndex(): number;
  setValue(value: TimeStateValue): void;
  setPanelValue(value: TimeStateValue): void;
  setInputValue(value: TimeInputValue): void;
  setVisible(value: boolean): void;
  setFocusedInputIndex(index: number): void;
  isDisabledTime(value: TimeStateValue): boolean;
  onUpdateValue(value: TimeInputValue): void;
  onChange(value: TimeInputValue, date: TimeDateValue): void;
  onSelect(
    value: Exclude<TimeInputValue, undefined>,
    date: Exclude<TimeDateValue, undefined>,
  ): void;
  onFormChange(): void;
  onClear(): void;
  onPopupChange(visible: boolean): void;
  onUpdatePopup(visible: boolean): void;
  focusInput(index: number): void;
  afterRender(task: () => void): void;
}

export function createTimePickerFoundation(adapter: TimePickerAdapter) {
  function setPanelVisible(newVisible: boolean) {
    if (newVisible !== adapter.getVisible()) {
      adapter.setVisible(newVisible);
      adapter.onPopupChange(newVisible);
      adapter.onUpdatePopup(newVisible);
    }
  }
  function emitChange(value: Dayjs | Array<Dayjs | undefined> | undefined) {
    if (isValueChange(value, adapter.getValue())) {
      const formattedValue = getFormattedValue(value, adapter.getFormat());
      const dateValue = getDateValue(value);
      adapter.onUpdateValue(formattedValue);
      adapter.onChange(formattedValue, dateValue);
      adapter.onFormChange();
    }
  }

  function confirm(value: Dayjs | Array<Dayjs | undefined> | undefined, showPanel: boolean) {
    if (adapter.getDisabled() || adapter.getReadonly() || adapter.isDisabledTime(value)) return;

    let newValue = value;

    if (isArray(value)) {
      const now = dayjs();
      newValue = value.map((item) => {
        if (item) {
          item = item.year(now.year());
          item = item.month(now.month());
          item = item.date(now.date());
        }
        return item;
      });
      if (isValidRangeValue(newValue)) {
        newValue = getSortedDayjsArray(newValue as Dayjs[]);
      }
      if (newValue?.length === 0) {
        newValue = undefined;
      }
    }

    emitChange(newValue);
    adapter.setValue(newValue);

    if (showPanel !== adapter.getVisible()) {
      setPanelVisible(showPanel);
    }
  }

  function select(value: Dayjs | Array<Dayjs | undefined>, showPanel: boolean) {
    adapter.setPanelValue(value);

    if (showPanel !== adapter.getVisible()) {
      setPanelVisible(showPanel);
    }
  }

  function onPanelVisibleChange(newVisible: boolean) {
    if (adapter.getDisabled()) return;
    setPanelVisible(newVisible);

    if (newVisible) {
      adapter.afterRender(() => {
        adapter.focusInput(adapter.getFocusedIndex());
      });
    }
  }

  function onPanelSelect(value: Dayjs | Array<Dayjs | undefined>) {
    // 先触发 select 事件
    const formattedValue = getFormattedValue(value, adapter.getFormat()) as
      | string
      | Array<string | undefined>;
    const dateValue = getDateValue(value) as Date | Array<Date | undefined>;
    adapter.onSelect(formattedValue, dateValue);

    if (adapter.getDisableConfirm() && (!adapter.getRange() || isValidRangeValue(value))) {
      confirm(value, true);
    } else {
      select(value, true);
      adapter.setInputValue(undefined);
    }
  }

  function onPanelConfirm(value: Dayjs | Dayjs[]) {
    confirm(value, false);
  }

  function onInputPressEnter() {
    confirm(adapter.getPanelValue() || adapter.getValue(), false);
  }

  function onRangeInputPressEnter() {
    if (isValidRangeValue(adapter.getPanelValue())) {
      confirm(adapter.getPanelValue(), false);
    } else {
      const newFocusedInputIndex = (adapter.getFocusedIndex() + 1) % 2;
      adapter.setFocusedInputIndex(newFocusedInputIndex);
      adapter.focusInput(newFocusedInputIndex);
    }
  }

  function onInputChange(targetValue: string) {
    setPanelVisible(true);

    adapter.setInputValue(targetValue);

    if (!isValidInputValue(targetValue, adapter.getFormat())) return;

    const newValue = dayjs(targetValue, adapter.getFormat());

    if (adapter.isDisabledTime(newValue)) return;

    if (adapter.getDisableConfirm()) {
      confirm(newValue, true);
    } else {
      select(newValue, true);
    }
  }

  function onRangeInputChange(targetValue: string) {
    setPanelVisible(true);

    const currentInputValue = adapter.getInputValue();
    const newInputValue = isArray(currentInputValue)
      ? [...currentInputValue]
      : (isArray(adapter.getPanelValue()) &&
          (getFormattedValue(adapter.getPanelValue(), adapter.getFormat()) as Array<
            string | undefined
          >)) ||
        [];
    newInputValue[adapter.getFocusedIndex()] = targetValue;

    adapter.setInputValue(newInputValue);

    if (!isValidInputValue(targetValue, adapter.getFormat())) return;

    const targetValueDayjs = dayjs(targetValue, adapter.getFormat());

    if (adapter.isDisabledTime(targetValueDayjs)) return;

    const currentPanelValue = adapter.getPanelValue();
    const newValue = isArray(currentPanelValue) ? [...currentPanelValue] : [];
    newValue[adapter.getFocusedIndex()] = targetValueDayjs;

    if (adapter.getDisableConfirm() && isValidRangeValue(newValue)) {
      confirm(newValue, true);
    } else {
      select(newValue, true);
    }
  }

  function onClear() {
    adapter.setPanelValue(undefined);
    confirm(undefined, adapter.getRange());
    adapter.onClear();
  }

  return {
    onPanelVisibleChange,
    onPanelSelect,
    onPanelConfirm,
    onInputPressEnter,
    onRangeInputPressEnter,
    onInputChange,
    onRangeInputChange,
    onClear,
  };
}
