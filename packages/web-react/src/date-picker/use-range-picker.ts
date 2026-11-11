import type {
  DateRangeAdapter,
  DateRangeValue,
} from '@sdata/web-core/date-picker/range-foundation';
import type {
  CalendarValue,
  RangeDisabledDate,
  RangeDisabledTime,
} from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';
import type { RefObject } from 'react';

import { getDateValue, getDayjsValue, getNow, toLocal } from '@sdata/web-core/_utils/date';
import { isDatePickerDisabled } from '@sdata/web-core/date-picker/disabled';
import { getDefaultFormat, getDefaultValueFormat } from '@sdata/web-core/date-picker/format';
import { getSelectedHeaderValue } from '@sdata/web-core/date-picker/header';
import {
  createDateRangeFoundation,
  getDateRangeDisabled,
  getDateRangeFocusedIndex,
  getDateRangeNextIndex,
} from '@sdata/web-core/date-picker/range-foundation';
import { isCompleteRangeValue, normalizeRangeValue } from '@sdata/web-core/date-picker/utils';
import { getInitialDateValue, getReturnRangeValue } from '@sdata/web-core/date-picker/values';
import { useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { PickerInputInstance } from '../_shared/picker-input.js';
import type { DatePickerShortcut } from './panel-shortcuts.js';
import type { DatePickerStateOptions } from './use-date-picker.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useFormItem } from '../form/context.js';
import { useRangeDateTimeValue } from './use-date-time-value.js';
import { useRangeDateHeader } from './use-range-date-header.js';

type RangeEvents = DateRangeAdapter<DatePickerShortcut>;
export interface RangePickerStateOptions extends Omit<
  DatePickerStateOptions,
  | 'value'
  | 'defaultValue'
  | 'format'
  | 'disabled'
  | 'disabledDate'
  | 'disabledTime'
  | 'pickerValue'
  | 'defaultPickerValue'
  | 'onValueChange'
  | 'onChange'
  | 'onSelect'
  | 'onOk'
  | 'onPickerValueChange'
  | 'onUpdatePickerValue'
> {
  value?: Array<CalendarValue | undefined>;
  defaultValue?: Array<CalendarValue | undefined>;
  format?: string;
  disabled?: boolean | boolean[];
  disabledInput?: boolean;
  disabledDate?: RangeDisabledDate;
  disabledTime?: RangeDisabledTime;
  pickerValue?: CalendarValue[];
  defaultPickerValue?: CalendarValue[];
  exchangeTime?: boolean;
  fixedTime?: boolean;
  clearRangeOnReselect?: boolean;
  onValueChange?: RangeEvents['onUpdateValue'];
  onChange?: RangeEvents['onChange'];
  onSelect?: RangeEvents['onSelect'];
  onOk?: RangeEvents['onOk'];
  onPickerValueChange?(value: CalendarValue[], date: Date[], formatted: string[]): void;
  onUpdatePickerValue?(value: CalendarValue[]): void;
}

export function useRangePicker(
  props: RangePickerStateOptions,
  input: RefObject<PickerInputInstance | null>,
) {
  const form = useFormItem({});
  const mode = props.mode ?? 'date';
  const format = props.format || getDefaultFormat(mode, props.showTime);
  const returnFormat = props.valueFormat || getDefaultValueFormat(mode, props.showTime);
  const parseFormat = ['timestamp', 'Date'].includes(returnFormat) ? format : returnFormat;
  const disabledInputs = getDateRangeDisabled(props.disabled ?? false, form.mergedDisabled);
  const disabled = disabledInputs.every(Boolean);
  const needConfirm = !!((mode === 'date' && props.showTime) || props.showConfirm);
  const model = useMemo(
    () =>
      getDayjsValue(normalizeRangeValue(props.value), parseFormat, props.utcOffset, props.timezone),
    [props.value, parseFormat, props.utcOffset, props.timezone],
  );
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [local] = useState(() => ({
    value: getInitialDateValue(
      model,
      () =>
        getDayjsValue(
          normalizeRangeValue(props.defaultValue),
          parseFormat,
          props.utcOffset,
          props.timezone,
        ),
      [],
    ),
    process: undefined as DateRangeValue | undefined,
    preview: undefined as DateRangeValue | undefined,
    draft: undefined as Array<string | undefined> | undefined,
    startHeaderMode: undefined as 'year' | 'month' | undefined,
    endHeaderMode: undefined as 'year' | 'month' | undefined,
    visible: props.defaultPopupVisible ?? false,
    index: getDateRangeFocusedIndex(disabledInputs),
  }));
  const value = model ?? local.value;
  const panelValue = local.preview ?? local.process ?? value;
  const visible = props.popupVisible ?? local.visible;
  const header = useRangeDateHeader({
    mode,
    startHeaderMode: local.startHeaderMode,
    endHeaderMode: local.endHeaderMode,
    value: props.pickerValue,
    defaultValue: props.defaultPickerValue,
    selectedValue: panelValue,
    format: parseFormat,
    utcOffset: props.utcOffset,
    timezone: props.timezone,
    onChange: (next) => {
      const returned = getReturnRangeValue(next, returnFormat, props.utcOffset, props.timezone);
      const dates = next.map((date) => toLocal(date, props.utcOffset, props.timezone));
      props.onPickerValueChange?.(
        returned,
        getDateValue(dates),
        dates.map((date) => date.format(parseFormat)),
      );
      props.onUpdatePickerValue?.(returned);
    },
  });
  const time = useRangeDateTimeValue(panelValue, props.timePickerProps);
  const footer = useRef([
    panelValue[0] ?? getNow(props.utcOffset, props.timezone),
    panelValue[1] ?? getNow(props.utcOffset, props.timezone),
  ]);
  footer.current = footer.current.map((date, index) => panelValue[index] ?? date);
  const current = useRef({
    props,
    form,
    mode,
    format,
    parseFormat,
    returnFormat,
    disabledInputs,
    disabled,
    needConfirm,
    value,
    panelValue,
    visible,
    header,
    time,
  });
  current.current = {
    props,
    form,
    mode,
    format,
    parseFormat,
    returnFormat,
    disabledInputs,
    disabled,
    needConfirm,
    value,
    panelValue,
    visible,
    header,
    time,
  };
  const afterRender = useAfterRender();
  const mounted = useRef(true);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(previewTimer.current);
    };
  }, []);
  const setFocusedIndex = (index: number) => {
    local.index = index;
    render();
  };
  const [foundation] = useState(() =>
    createDateRangeFoundation<DatePickerShortcut>({
      get selectedValue() {
        return current.current.value;
      },
      get processValue() {
        return local.process;
      },
      get panelValue() {
        return current.current.panelValue;
      },
      get inputValue() {
        return local.draft;
      },
      get timeValue() {
        return current.current.time.value;
      },
      get focusedIndex() {
        return local.index;
      },
      get nextFocusedIndex() {
        return getDateRangeNextIndex(current.current.disabledInputs, local.index);
      },
      get isNextDisabled() {
        return current.current.disabledInputs[local.index ^ 1];
      },
      get disabled() {
        return current.current.disabled;
      },
      get disabledInputs() {
        return current.current.disabledInputs;
      },
      get readonly() {
        return !!current.current.props.readonly;
      },
      get visible() {
        return current.current.visible;
      },
      get needConfirm() {
        return current.current.needConfirm;
      },
      get hasTime() {
        return !!(
          (current.current.mode === 'date' && current.current.props.showTime) ||
          current.current.props.timePickerProps
        );
      },
      get exchangeTime() {
        return current.current.props.exchangeTime ?? true;
      },
      get fixedTime() {
        return current.current.props.fixedTime ?? false;
      },
      get clearRangeOnReselect() {
        return current.current.props.clearRangeOnReselect ?? false;
      },
      get utcOffset() {
        return current.current.props.utcOffset;
      },
      get timezone() {
        return current.current.props.timezone;
      },
      get returnFormat() {
        return current.current.returnFormat;
      },
      get parseFormat() {
        return current.current.parseFormat;
      },
      get format() {
        return current.current.format;
      },
      setSelectedValue: (next) => {
        local.value = next;
        render();
      },
      setProcessValue: (next) => {
        local.process = next;
        render();
      },
      setPreviewValue: (next) => {
        local.preview = next;
        render();
      },
      setInputValue: (next) => {
        local.draft = next;
        render();
      },
      setTimePickerValue: (next) => current.current.time.setValue(next),
      setFocusedIndex,
      resetHeaderModes: () => {
        local.startHeaderMode = undefined;
        local.endHeaderMode = undefined;
        render();
      },
      resetHeaderValue: () => current.current.header.resetValue(),
      resetTimeValue: () => current.current.time.resetValue(),
      focusInput: (index) => input.current?.focus(index),
      afterRender: (task) => {
        void afterRender().then(() => {
          if (mounted.current) task();
        });
      },
      setVisible: (next) => {
        local.visible = next;
        render();
      },
      isDisabledDate: (date, type) =>
        isDatePickerDisabled(
          date,
          { ...current.current.props, mode: current.current.mode, isRange: true },
          type,
        ),
      onUpdateValue: (next) => current.current.props.onValueChange?.(next),
      onChange: (...args) => current.current.props.onChange?.(...args),
      onOk: (...args) => current.current.props.onOk?.(...args),
      onSelect: (...args) => current.current.props.onSelect?.(...args),
      onShortcut: (item) => current.current.props.onSelectShortcut?.(item),
      onClear: () => current.current.props.onClear?.(),
      onFormChange: () => current.current.form.eventHandlers?.onChange?.(),
      onPopupChange: (next) => current.current.props.onPopupVisibleChange?.(next),
      onUpdatePopup: (next) => current.current.props.onUpdatePopupVisible?.(next),
      cancelPreviewClear: () => clearTimeout(previewTimer.current),
      schedulePreviewClear: (task) => {
        previewTimer.current = setTimeout(task, 100);
      },
    }),
  );
  const previous = useRef({
    propValue: props.value,
    model,
    visible,
    disabled0: disabledInputs[0],
    disabled1: disabledInputs[1],
    index: local.index,
  });
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = {
      propValue: props.value,
      model,
      visible,
      disabled0: disabledInputs[0],
      disabled1: disabledInputs[1],
      index: local.index,
    };
    if (model !== before.model && model === undefined) {
      local.value = [];
      render();
    }
    if (props.value !== before.propValue) foundation.onModelChange();
    if (visible !== before.visible) foundation.onVisibilityChange(visible);
    if (
      !disabled &&
      (before.disabled0 !== disabledInputs[0] || before.disabled1 !== disabledInputs[1])
    ) {
      setFocusedIndex(getDateRangeFocusedIndex(disabledInputs, local.index));
    }
    if (props.disabledInput && before.index !== local.index) {
      input.current?.focus(local.index);
      local.draft = undefined;
      render();
    }
  }, [
    props.value,
    props.disabledInput,
    model,
    visible,
    disabled,
    disabledInputs[0],
    disabledInputs[1],
    local.index,
  ]);
  const pending = local.process ?? value;
  const confirmDisabled =
    needConfirm &&
    (!isCompleteRangeValue(pending) ||
      !!isDatePickerDisabled(pending[0], { ...props, mode, isRange: true }, 'start') ||
      !!isDatePickerDisabled(pending[1], { ...props, mode, isRange: true }, 'end'));
  const setHeaderMode = (type: 'start' | 'end', next: 'year' | 'month') => {
    if (type === 'start') local.startHeaderMode = next;
    else local.endHeaderMode = next;
    render();
  };
  const selectHeader = (type: 'start' | 'end', date: Dayjs) => {
    if (type === 'start') {
      header.setValue([
        getSelectedHeaderValue(header.startValue, date, local.startHeaderMode),
        header.endValue,
      ]);
      local.startHeaderMode = undefined;
    } else {
      header.setValue([
        header.startValue,
        getSelectedHeaderValue(header.endValue, date, local.endHeaderMode),
      ]);
      local.endHeaderMode = undefined;
    }
    render();
  };
  return {
    foundation,
    form,
    mode,
    format,
    parseFormat,
    returnFormat,
    disabledInputs,
    disabled,
    needConfirm,
    value,
    panelValue,
    visible,
    local,
    header,
    time,
    footerValue: footer.current,
    confirmDisabled,
    setFocusedIndex,
    setHeaderMode,
    selectHeader,
  };
}
