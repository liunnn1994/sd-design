import type { Dayjs } from 'dayjs';

import type { CalendarValue } from './types.js';

import {
  getNow,
  getDayjsValue,
  getDateValue,
  getSortedDayjsArray,
  isValueChange,
  toLocal,
} from '../_utils/date.js';
import { isArray, isBoolean } from '../_utils/is.js';
import { getFormattedValue, isValidInputValue } from '../time-picker/values.js';
import { isCompleteRangeValue, isValidRangeValue, mergeValueWithTime } from './utils.js';
import { getReturnRangeValue } from './values.js';

export type DateRangeValue = Array<Dayjs | undefined>;
type RangeValueEvent = (
  value: Array<CalendarValue | undefined> | undefined,
  date: Array<Date | undefined> | undefined,
  formatted: Array<string | undefined> | undefined,
) => void;
export interface DateRangeAdapter<S> {
  readonly selectedValue: DateRangeValue;
  readonly processValue: DateRangeValue | undefined;
  readonly panelValue: DateRangeValue;
  readonly inputValue: Array<string | undefined> | undefined;
  readonly timeValue: Dayjs[];
  readonly focusedIndex: number;
  readonly nextFocusedIndex: number;
  readonly isNextDisabled: boolean;
  readonly disabled: boolean;
  readonly disabledInputs: boolean[];
  readonly readonly: boolean;
  readonly visible: boolean;
  readonly needConfirm: boolean;
  readonly hasTime: boolean;
  readonly exchangeTime: boolean;
  readonly fixedTime: boolean;
  readonly clearRangeOnReselect: boolean;
  readonly utcOffset: number | undefined;
  readonly timezone: string | undefined;
  readonly returnFormat: string;
  readonly parseFormat: string;
  readonly format: string;
  setSelectedValue(value: DateRangeValue): void;
  setProcessValue(value: DateRangeValue | undefined): void;
  setPreviewValue(value: DateRangeValue | undefined): void;
  setInputValue(value: Array<string | undefined> | undefined): void;
  setTimePickerValue(value: Dayjs[]): void;
  setFocusedIndex(index: number): void;
  resetHeaderModes(): void;
  resetHeaderValue(): void;
  resetTimeValue(): void;
  focusInput(index: number): void;
  afterRender(task: () => void): void;
  setVisible(value: boolean): void;
  isDisabledDate(value: Dayjs | undefined, type: 'start' | 'end'): boolean | undefined;
  onUpdateValue(value: Array<CalendarValue | undefined> | undefined): void;
  onChange: RangeValueEvent;
  onOk(value: CalendarValue[], date: Date[], formatted: string[]): void;
  onSelect(
    value: Array<CalendarValue | undefined>,
    date: Array<Date | undefined>,
    formatted: Array<string | undefined>,
  ): void;
  onShortcut(shortcut: S): void;
  onClear(): void;
  onFormChange(): void;
  onPopupChange(visible: boolean): void;
  onUpdatePopup(visible: boolean): void;
  cancelPreviewClear(): void;
  schedulePreviewClear(task: () => void): void;
}

export function createDateRangeFoundation<S>(adapter: DateRangeAdapter<S>) {
  function onModelChange() {
    adapter.setProcessValue(undefined);
    adapter.setPreviewValue(undefined);
    adapter.setInputValue(undefined);
    adapter.resetHeaderValue();
  }
  function onVisibilityChange(visible: boolean) {
    adapter.resetHeaderModes();
    adapter.setProcessValue(undefined);
    adapter.setPreviewValue(undefined);
    if (visible) {
      adapter.resetHeaderValue();
      adapter.resetTimeValue();
      adapter.setFocusedIndex(
        getDateRangeFocusedIndex(adapter.disabledInputs, adapter.focusedIndex),
      );
      adapter.afterRender(() => adapter.focusInput(adapter.focusedIndex));
    }
    if (!visible) adapter.setInputValue(undefined);
  }
  function setPanelVisible(newVisible: boolean) {
    if (adapter.visible !== newVisible) {
      adapter.setVisible(newVisible);
      adapter.onPopupChange(newVisible);
      adapter.onUpdatePopup(newVisible);
    }
  }
  function emitChange(value: Array<Dayjs | undefined> | undefined, emitOk?: boolean) {
    const localValue = value?.map((item) =>
      item ? toLocal(item, adapter.utcOffset, adapter.timezone) : undefined,
    );
    const returnValue = value
      ? getReturnRangeValue(value, adapter.returnFormat, adapter.utcOffset, adapter.timezone)
      : undefined;
    const formattedValue = getFormattedValue(localValue, adapter.parseFormat);
    const dateValue = getDateValue(localValue);
    if (isValueChange(value, adapter.selectedValue)) {
      adapter.onUpdateValue(returnValue);
      adapter.onChange(returnValue, dateValue, formattedValue);
      adapter.onFormChange();
    }
    if (emitOk) {
      if (
        Array.isArray(returnValue) &&
        returnValue.every((item): item is CalendarValue => item !== undefined) &&
        Array.isArray(dateValue) &&
        dateValue.every((item): item is Date => item !== undefined) &&
        Array.isArray(formattedValue) &&
        formattedValue.every((item): item is string => item !== undefined)
      ) {
        adapter.onOk(returnValue, dateValue, formattedValue);
      }
    }
  }

  function getSortedDayjsArrayByExchangeTimeOrNot(newValue: Dayjs[]) {
    let sortedValue = getSortedDayjsArray(newValue, adapter.fixedTime);
    if (adapter.hasTime && !adapter.exchangeTime && !adapter.fixedTime) {
      sortedValue = [
        getMergedOpValue(sortedValue[0], newValue[0]),
        getMergedOpValue(sortedValue[1], newValue[1]),
      ];
    }
    return sortedValue;
  }

  function changesDisabledEndpoint(value: Array<Dayjs | undefined> | undefined) {
    return adapter.disabledInputs.some(
      (disabled, index) => disabled && isValueChange(value?.[index], adapter.selectedValue[index]),
    );
  }

  function confirm(
    value: Array<Dayjs | undefined> | undefined,
    showPanel?: boolean,
    emitOk?: boolean,
  ) {
    if (adapter.disabled || adapter.readonly) return;
    let newValue = value ? [...value] : undefined;

    if (isCompleteRangeValue(newValue)) {
      newValue = getSortedDayjsArrayByExchangeTimeOrNot(newValue);
    }

    if (
      adapter.isDisabledDate(newValue?.[0], 'start') ||
      adapter.isDisabledDate(newValue?.[1], 'end')
    ) {
      return;
    }
    if (changesDisabledEndpoint(newValue)) return;

    emitChange(newValue, emitOk);
    adapter.setSelectedValue(newValue || []);
    adapter.setProcessValue(undefined);
    adapter.setPreviewValue(undefined);
    adapter.setInputValue(undefined);
    adapter.resetHeaderModes();

    if (isBoolean(showPanel)) {
      setPanelVisible(showPanel);
    }
  }

  function emitSelectEvent(value: Array<Dayjs | undefined>) {
    const localValue = value.map((item) =>
      item ? toLocal(item, adapter.utcOffset, adapter.timezone) : undefined,
    );
    const returnValue = getReturnRangeValue(
      value,
      adapter.returnFormat,
      adapter.utcOffset,
      adapter.timezone,
    );
    const formattedValue = getFormattedValue(localValue, adapter.parseFormat);
    const dateValue = getDateValue(localValue);
    adapter.onSelect(returnValue ?? [], dateValue ?? [], formattedValue ?? []);
  }

  function select(
    value: Array<Dayjs | undefined>,
    options?: {
      emitSelect?: boolean;
      updateHeader?: boolean;
    },
  ) {
    if (adapter.disabled || adapter.readonly) return;
    const { emitSelect = false, updateHeader = false } = options || {};

    let newValue = [...value];
    if (isCompleteRangeValue(newValue)) {
      newValue = getSortedDayjsArrayByExchangeTimeOrNot(newValue);
    }

    if (changesDisabledEndpoint(newValue)) return;
    adapter.setProcessValue(newValue);
    adapter.setPreviewValue(undefined);
    adapter.setInputValue(undefined);
    adapter.resetHeaderModes();

    if (emitSelect) {
      emitSelectEvent(newValue);
    }

    if (updateHeader) {
      adapter.resetHeaderValue();
    }
  }

  function preview(
    value: Array<Dayjs | undefined>,
    options?: {
      emitSelect?: boolean;
      updateHeader?: boolean;
    },
  ) {
    if (adapter.disabled || adapter.readonly) return;
    const { updateHeader = false } = options || {};
    if (changesDisabledEndpoint(value)) return;
    adapter.setPreviewValue(value);
    adapter.setInputValue(undefined);

    if (updateHeader) {
      adapter.resetHeaderValue();
    }
  }

  function getMergedOpValue(date: Dayjs, time?: Dayjs) {
    if (!adapter.hasTime) return date;
    return mergeValueWithTime(getNow(adapter.utcOffset, adapter.timezone), date, time);
  }

  function onPanelVisibleChange(visible: boolean) {
    setPanelVisible(visible);
  }

  function onPanelCellMouseEnter(date: Dayjs) {
    if (
      adapter.processValue &&
      adapter.panelValue[adapter.nextFocusedIndex] &&
      (!adapter.needConfirm || !isCompleteRangeValue(adapter.processValue))
    ) {
      const newValue = [...adapter.panelValue];
      const mergedOpValue = getMergedOpValue(date, adapter.timeValue[adapter.focusedIndex]);
      newValue[adapter.focusedIndex] = mergedOpValue;

      preview(newValue);
    }
  }

  function getValueToModify(isTime = false) {
    if (adapter.isNextDisabled) return [...adapter.selectedValue];
    if (adapter.processValue) {
      return isTime || !isCompleteRangeValue(adapter.processValue) || !adapter.clearRangeOnReselect
        ? [...adapter.processValue]
        : [];
    }
    if (!isTime && !adapter.clearRangeOnReselect) {
      return [...adapter.selectedValue];
    }
    return isTime ? [...adapter.selectedValue] : [];
  }

  function onPanelCellClick(date: Dayjs) {
    if (adapter.disabled || adapter.readonly) return;
    const newValue = getValueToModify();
    const mergedOpValue = getMergedOpValue(date, adapter.timeValue[adapter.focusedIndex]);
    newValue[adapter.focusedIndex] = mergedOpValue;

    emitSelectEvent(newValue);
    if (!adapter.needConfirm && isCompleteRangeValue(newValue)) {
      confirm(newValue, false);
    } else {
      select(newValue);
      if (!isCompleteRangeValue(newValue)) {
        adapter.setFocusedIndex(adapter.nextFocusedIndex);
      } else {
        adapter.setFocusedIndex(0);
      }
    }
  }

  function onTimePickerSelect(time: Dayjs, type: 'start' | 'end') {
    if (adapter.disabled || adapter.readonly) return;
    const updateIndex = type === 'start' ? 0 : 1;
    const mergedOpValue = getMergedOpValue(adapter.timeValue[updateIndex], time);
    const newTimeValue = [...adapter.timeValue];
    newTimeValue[updateIndex] = mergedOpValue;
    adapter.setTimePickerValue(newTimeValue);

    const newValue = getValueToModify(true);
    if (newValue[updateIndex]) {
      newValue[updateIndex] = mergedOpValue;
      select(newValue, { emitSelect: true });
    }
  }

  function onPanelShortcutMouseEnter(value: Array<Dayjs | undefined>) {
    adapter.cancelPreviewClear();
    preview(value, { updateHeader: true });
  }

  function onPanelShortcutMouseLeave() {
    adapter.cancelPreviewClear();
    adapter.schedulePreviewClear(() => {
      adapter.setPreviewValue(undefined);
      adapter.setInputValue(undefined);
      adapter.resetHeaderValue();
    });
  }

  function onPanelShortcutClick(value: Array<Dayjs | undefined>, shortcut: S) {
    if (adapter.disabled || adapter.readonly) return;
    adapter.onShortcut(shortcut);
    confirm(value, false);
  }

  function onPanelConfirm() {
    confirm(adapter.panelValue, false, true);
  }

  function onInputClear() {
    confirm(undefined);
    adapter.onClear();
  }

  function onInputChange(targetValue: string) {
    setPanelVisible(true);

    // TODO: Null value should be restored to the current value, invalid when deleted as a whole
    if (!targetValue) {
      adapter.setInputValue(undefined);
      return;
    }

    const formattedPanelValue = getFormattedValue(adapter.panelValue, adapter.format) as Array<
      string | undefined
    >;

    const newInputValue = isArray(adapter.inputValue)
      ? [...adapter.inputValue]
      : formattedPanelValue || [];

    newInputValue[adapter.focusedIndex] = targetValue;

    adapter.setInputValue(newInputValue);

    if (!isValidInputValue(targetValue, adapter.format)) return;

    const targetValueDayjs = getDayjsValue(
      targetValue,
      adapter.format,
      adapter.utcOffset,
      adapter.timezone,
    ) as Dayjs;

    if (adapter.isDisabledDate(targetValueDayjs, adapter.focusedIndex === 0 ? 'start' : 'end'))
      return;

    const newValue = isArray(adapter.panelValue) ? [...adapter.panelValue] : [];
    newValue[adapter.focusedIndex] = targetValueDayjs;

    select(newValue, { updateHeader: true });
  }

  function onInputPressEnter() {
    if (isValidRangeValue(adapter.panelValue)) {
      confirm(adapter.panelValue, false);
    } else {
      adapter.setFocusedIndex(adapter.nextFocusedIndex);
    }
  }

  return {
    onModelChange,
    onVisibilityChange,
    onPanelVisibleChange,
    onPanelCellMouseEnter,
    onPanelCellClick,
    onTimePickerSelect,
    onPanelShortcutMouseEnter,
    onPanelShortcutMouseLeave,
    onPanelShortcutClick,
    onPanelConfirm,
    onInputClear,
    onInputChange,
    onInputPressEnter,
  };
}

export function getDateRangeDisabled(disabled: boolean | boolean[], formDisabled: boolean) {
  return [0, 1].map(
    (index) => disabled === true || formDisabled || (isArray(disabled) && disabled[index] === true),
  );
}
export function getDateRangeFocusedIndex(disabled: boolean[], current = 0) {
  return disabled[current] ? current ^ 1 : current;
}
export function getDateRangeNextIndex(disabled: boolean[], current: number) {
  const next = current ^ 1;
  return disabled[next] ? current : next;
}
