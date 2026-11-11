import type { DateHeaderMode, DatePickerAdapter } from '@sdata/web-core/date-picker/foundation';
import type {
  CalendarValue,
  DisabledDate,
  DisabledTime,
  FormatFunc,
  Mode,
  ValueFormat,
} from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';

import { getDateValue, getDayjsValue, toLocal } from '@sdata/web-core/_utils/date';
import { isDatePickerDisabled } from '@sdata/web-core/date-picker/disabled';
import { getDefaultFormat, getDefaultValueFormat } from '@sdata/web-core/date-picker/format';
import { createDatePickerFoundation } from '@sdata/web-core/date-picker/foundation';
import { getInitialDateValue, getReturnValue } from '@sdata/web-core/date-picker/values';
import { getFormattedValue } from '@sdata/web-core/time-picker/values';
import { useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { TimePickerProps } from '../time-picker/types.js';
import type { DatePickerShortcut } from './panel-shortcuts.js';

import { useFormItem } from '../form/context.js';
import { useDateHeader } from './use-date-header.js';
import { useDateTimeValue } from './use-date-time-value.js';

export type DatePickerChangeHandler = DatePickerAdapter<DatePickerShortcut>['onChange'];
export interface DatePickerStateOptions {
  mode?: Mode;
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  format?: string | FormatFunc;
  valueFormat?: ValueFormat;
  utcOffset?: number;
  timezone?: string;
  showTime?: boolean;
  showConfirm?: boolean;
  disabled?: boolean;
  readonly?: boolean | string;
  disabledDate?: DisabledDate;
  disabledTime?: DisabledTime;
  timePickerProps?: Partial<TimePickerProps>;
  pickerValue?: CalendarValue;
  defaultPickerValue?: CalendarValue;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onValueChange?(value: CalendarValue | undefined): void;
  onChange?: DatePickerChangeHandler;
  onSelect?: DatePickerChangeHandler;
  onOk?: DatePickerChangeHandler;
  onClear?(): void;
  onSelectShortcut?(shortcut: DatePickerShortcut): void;
  onPopupVisibleChange?(visible: boolean): void;
  onUpdatePopupVisible?(visible: boolean): void;
  onPickerValueChange?(value: CalendarValue, date: Date, formatted: string): void;
  onUpdatePickerValue?(value: CalendarValue): void;
}

export function useDatePicker(props: DatePickerStateOptions) {
  const form = useFormItem({ disabled: props.disabled });
  const mode = props.mode ?? 'date';
  const format =
    (typeof props.format === 'string' && props.format) || getDefaultFormat(mode, props.showTime);
  const returnFormat = props.valueFormat || getDefaultValueFormat(mode, props.showTime);
  const parseFormat = ['timestamp', 'Date'].includes(returnFormat) ? format : returnFormat;
  const needConfirm = !!(props.showTime || props.showConfirm);
  const model = useMemo(
    () => getDayjsValue(props.value, parseFormat, props.utcOffset, props.timezone),
    [props.value, parseFormat, props.utcOffset, props.timezone],
  );
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [local] = useState(() => ({
    value: getInitialDateValue(
      model,
      () => getDayjsValue(props.defaultValue, parseFormat, props.utcOffset, props.timezone),
      undefined,
    ),
    process: undefined as Dayjs | undefined,
    preview: undefined as Dayjs | undefined,
    draft: undefined as string | undefined,
    headerMode: undefined as DateHeaderMode,
    visible: props.defaultPopupVisible ?? false,
  }));
  const value = model ?? local.value;
  const panelValue = local.preview ?? local.process ?? value;
  const visible = props.popupVisible ?? local.visible;
  const header = useDateHeader({
    mode,
    value: props.pickerValue,
    defaultValue: props.defaultPickerValue,
    selectedValue: panelValue,
    format: parseFormat,
    utcOffset: props.utcOffset,
    timezone: props.timezone,
    onChange: (next) => {
      const returned = getReturnValue(next, returnFormat, props.utcOffset, props.timezone);
      const date = toLocal(next, props.utcOffset, props.timezone);
      props.onPickerValueChange?.(
        returned,
        getDateValue(date),
        getFormattedValue(date, parseFormat),
      );
      props.onUpdatePickerValue?.(returned);
    },
  });
  const time = useDateTimeValue(
    panelValue,
    props.timePickerProps as Parameters<typeof useDateTimeValue>[1],
  );
  const current = useRef({
    props,
    form,
    mode,
    format,
    parseFormat,
    returnFormat,
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
    needConfirm,
    value,
    panelValue,
    visible,
    header,
    time,
  };
  const previewTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useLayoutEffect(() => () => clearTimeout(previewTimer.current), []);
  const [foundation] = useState(() =>
    createDatePickerFoundation<DatePickerShortcut>({
      getSelectedValue: () => current.current.value,
      getPanelValue: () => current.current.panelValue,
      getHeaderValue: () => current.current.header.value,
      getTimeValue: () => current.current.time.value,
      getFormat: () => current.current.format,
      getParseFormat: () => current.current.parseFormat,
      getReturnFormat: () => current.current.returnFormat,
      getUtcOffset: () => current.current.props.utcOffset,
      getTimezone: () => current.current.props.timezone,
      getMode: () => current.current.mode,
      getHeaderMode: () => local.headerMode,
      getVisible: () => current.current.visible,
      getDisabled: () => current.current.form.mergedDisabled,
      getReadonly: () => !!current.current.props.readonly,
      getIsDateTime: () => current.current.mode === 'date' && !!current.current.props.showTime,
      getHasTimePickerProps: () => !!current.current.props.timePickerProps,
      getNeedConfirm: () => current.current.needConfirm,
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
      setHeaderValue: (next) => current.current.header.setValue(next),
      setHeaderMode: (next) => {
        local.headerMode = next;
        render();
      },
      setVisible: (next) => {
        local.visible = next;
        render();
      },
      resetHeaderValue: () => current.current.header.resetValue(),
      resetTimeValue: () => current.current.time.resetValue(),
      isDisabledDate: (next) =>
        isDatePickerDisabled(next, { ...current.current.props, mode: current.current.mode }),
      onUpdateValue: (next) => current.current.props.onValueChange?.(next),
      onChange: (...args) => current.current.props.onChange?.(...args),
      onSelect: (...args) => current.current.props.onSelect?.(...args),
      onOk: (...args) => current.current.props.onOk?.(...args),
      onClear: () => current.current.props.onClear?.(),
      onShortcut: (item) => current.current.props.onSelectShortcut?.(item),
      onFormChange: () => current.current.form.eventHandlers?.onChange?.(),
      onPopupChange: (next) => current.current.props.onPopupVisibleChange?.(next),
      onUpdatePopup: (next) => current.current.props.onUpdatePopupVisible?.(next),
      cancelPreviewClear: () => clearTimeout(previewTimer.current),
      schedulePreviewClear: (task) => {
        previewTimer.current = setTimeout(task, 100);
      },
    }),
  );
  const previous = useRef({ propValue: props.value, model, visible });
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { propValue: props.value, model, visible };
    if (model !== before.model && model === undefined) {
      local.value = undefined;
      render();
    }
    if (props.value !== before.propValue) foundation.onModelChange();
    if (visible !== before.visible) foundation.onVisibilityChange(visible);
  }, [props.value, model, visible, foundation, local]);
  const confirmed = local.process ?? value;
  return {
    foundation,
    form,
    mode,
    format,
    parseFormat,
    returnFormat,
    needConfirm,
    value,
    panelValue,
    visible,
    local,
    header,
    time,
    confirmDisabled:
      needConfirm && (!confirmed || !!isDatePickerDisabled(confirmed, { ...props, mode })),
  };
}
