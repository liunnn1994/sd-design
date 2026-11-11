import type { DatePickerTriggerSlotProps, WeekStart } from '@sdata/web-core/date-picker/types';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from 'react';

import { dayjs, getDateValue, getNow, toLocal } from '@sdata/web-core/_utils/date';
import { getReturnValue } from '@sdata/web-core/date-picker/values';
import { useImperativeHandle, useRef } from 'react';

import type { PickerInputInstance } from '../_shared/picker-input.js';
import type { TriggerProps } from '../trigger/types.js';
import type { DatePanelHeaderProps } from './panel-header.js';
import type { DatePickerShortcut } from './panel-shortcuts.js';

import { PickerInput } from '../_shared/picker-input.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { IconCalendar } from '../icon/icon-calendar.js';
import { Trigger } from '../trigger/index.js';
import { DatePickerContext } from './context.js';
import { DatePickerPanel, type DatePickerPanelProps } from './picker-panel.js';
import { useDatePickerLocale } from './use-date-picker-locale.js';
import { useDatePicker, type DatePickerStateOptions } from './use-date-picker.js';

export interface PickerProps
  extends
    Omit<DatePickerStateOptions, 'showConfirm'>,
    Omit<
      ComponentPropsWithoutRef<'div'>,
      'defaultValue' | 'onChange' | 'onSelect' | 'prefix' | 'children'
    > {
  ref?: Ref<PickerInputInstance>;
  locale?: Record<string, unknown>;
  hideTrigger?: boolean;
  allowClear?: boolean;
  error?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large';
  placeholder?: string;
  disabledInput?: boolean;
  shortcuts?: DatePickerShortcut[];
  shortcutsPosition?: 'left' | 'bottom' | 'right';
  previewShortcut?: boolean;
  showConfirmBtn?: boolean;
  showNowBtn?: boolean;
  abbreviation?: boolean;
  dayStartOfWeek?: WeekStart;
  hideNotInViewDates?: boolean;
  position?: 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br';
  popupContainer?: string | HTMLElement;
  triggerProps?: Partial<TriggerProps>;
  floatingOptions?: TriggerProps['floatingOptions'];
  unmountOnClose?: boolean;
  inputProps?: ComponentPropsWithoutRef<'input'>;
  fitWidth?: boolean;
  maxWFull?: boolean;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  headerIcons?: DatePanelHeaderProps['icons'];
  extra?: ReactNode;
  renderCell?(date: Date): ReactNode;
  renderTrigger?(state: DatePickerTriggerSlotProps): ReactElement;
  renderPanel?(context: {
    component: typeof DatePickerPanel;
    props: DatePickerPanelProps;
  }): ReactNode;
  children?: ReactElement;
}

export function Picker(props: PickerProps) {
  const config = useConfig();
  const {
    ref,
    locale: localLocale,
    hideTrigger,
    allowClear,
    error,
    size,
    placeholder,
    disabledInput,
    shortcuts = config.datePicker?.shortcuts,
    shortcutsPosition = config.datePicker?.shortcutsPosition ?? 'bottom',
    previewShortcut = config.datePicker?.previewShortcut ?? true,
    showConfirmBtn = config.datePicker?.showConfirmBtn,
    showNowBtn = config.datePicker?.showNowBtn ?? true,
    abbreviation = config.datePicker?.abbreviation ?? true,
    dayStartOfWeek = config.datePicker?.dayStartOfWeek ?? 0,
    hideNotInViewDates,
    position = 'bl',
    popupContainer,
    triggerProps,
    floatingOptions,
    unmountOnClose,
    inputProps,
    fitWidth,
    maxWFull,
    prefix: before,
    suffixIcon,
    headerIcons,
    extra,
    renderCell,
    renderTrigger,
    renderPanel,
    children,
    mode: _mode,
    value: _value,
    defaultValue: _defaultValue,
    format: _format,
    valueFormat: _valueFormat,
    utcOffset,
    timezone,
    showTime,
    disabled: _disabled,
    readonly,
    disabledDate,
    disabledTime,
    timePickerProps,
    pickerValue: _pickerValue,
    defaultPickerValue: _defaultPickerValue,
    popupVisible: _popupVisible,
    defaultPopupVisible: _defaultPopupVisible,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onSelect: _onSelect,
    onOk: _onOk,
    onClear: _onClear,
    onSelectShortcut: _onSelectShortcut,
    onPopupVisibleChange: _onPopupVisibleChange,
    onUpdatePopupVisible: _onUpdatePopupVisible,
    onPickerValueChange: _onPickerValueChange,
    onUpdatePickerValue: _onUpdatePickerValue,
    ...attrs
  } = props;
  const state = useDatePicker({ ...props, showConfirm: showConfirmBtn });
  const { foundation, form, mode, format, panelValue, value, local, visible } = state;
  const prefix = usePrefix('picker');
  const input = useRef<PickerInputInstance>(null);
  useImperativeHandle(
    ref,
    () => ({ focus: () => input.current?.focus(), blur: () => input.current?.blur() }),
    [],
  );
  const translate = useDatePickerLocale(localLocale, dayStartOfWeek);
  const inputFormat =
    typeof props.format === 'function'
      ? (date: ReturnType<typeof dayjs>) =>
          (props.format as (date: Date) => string)(getDateValue(date))
      : format;
  const locked = form.mergedDisabled || !!readonly;
  const panelProps: DatePickerPanelProps = {
    prefixCls: prefix,
    mode,
    format: state.parseFormat,
    value: panelValue,
    hideTrigger,
    hideNotInViewDates,
    disabledDate,
    disabledTime,
    disabled: locked,
    showTime,
    timePickerProps: { format, ...timePickerProps },
    utcOffset,
    timezone,
    shortcuts,
    shortcutsPosition,
    dayStartOfWeek,
    abbreviation,
    showNowBtn: showNowBtn && mode === 'date',
    now: getNow(utcOffset, timezone),
    showConfirmBtn: state.needConfirm,
    confirmBtnDisabled: locked || state.confirmDisabled,
    headerValue: state.header.value,
    headerOperations: state.header.operations,
    headerMode: local.headerMode,
    headerIcons,
    timePickerValue: state.time.value,
    extra,
    renderCell,
    onCellClick: foundation.onPanelCellClick,
    onTimePickerSelect: foundation.onTimePickerSelect,
    onConfirm: foundation.onPanelConfirm,
    onTodayClick: foundation.onPanelSelect,
    onShortcutClick: foundation.onPanelShortcutClick,
    onShortcutMouseEnter: previewShortcut ? foundation.onPanelShortcutMouseEnter : undefined,
    onShortcutMouseLeave: previewShortcut ? foundation.onPanelShortcutMouseLeave : undefined,
    onHeaderLabelClick: foundation.onPanelHeaderLabelClick,
    onHeaderSelect: foundation.onPanelHeaderSelect,
    onMonthHeaderClick: foundation.onMonthHeaderClick,
    rootProps: hideTrigger ? attrs : undefined,
  };
  const panel = renderPanel ? (
    renderPanel({ component: DatePickerPanel, props: panelProps })
  ) : (
    <DatePickerPanel {...panelProps} />
  );
  const wrap = (element: ReactElement) => (
    <Trigger
      trigger="click"
      animationName="slide-dynamic-origin"
      autoFitTransformOrigin
      clickToClose={false}
      popupOffset={4}
      {...triggerProps}
      floatingOptions={floatingOptions ?? triggerProps?.floatingOptions}
      position={position}
      disabled={locked}
      preventFocus
      popupVisible={visible}
      unmountOnClose={unmountOnClose}
      popupContainer={popupContainer}
      ariaHasPopup="dialog"
      content={panel}
      onPopupVisibleChange={(next) => {
        foundation.onPanelVisibleChange(next);
        triggerProps?.onPopupVisibleChange?.(next);
      }}
    >
      {element}
    </Trigger>
  );
  const triggerValue = value ? toLocal(value, utcOffset, timezone) : undefined;
  const displayValue = triggerValue
    ? typeof inputFormat === 'function'
      ? inputFormat(triggerValue)
      : triggerValue.format(inputFormat)
    : '';
  const custom =
    renderTrigger?.({
      value: value ? getReturnValue(value, state.returnFormat, utcOffset, timezone) : undefined,
      date: getDateValue(triggerValue),
      displayValue,
      inputValue: local.draft,
      popupVisible: visible,
      disabled: form.mergedDisabled,
      readonly: !!readonly,
    }) ?? children;
  const sample = dayjs(new Date(2000, 0, 1));
  const fallback =
    typeof inputFormat === 'function' ? inputFormat(sample) : sample.format(inputFormat);
  return (
    <DatePickerContext.Provider value={{ datePickerT: translate }}>
      {hideTrigger ? (
        panel
      ) : custom ? (
        wrap(custom)
      ) : (
        <PickerInput
          ref={input}
          renderRoot={wrap}
          rootProps={attrs}
          size={size}
          error={error}
          focused={visible}
          disabled={form.mergedDisabled}
          readonly={readonly || disabledInput || typeof inputFormat === 'function'}
          allowClear={(allowClear ?? config.allowClear ?? true) && !readonly}
          placeholder={placeholder || translate(`datePicker.placeholder.${mode}`)}
          value={state.needConfirm ? panelValue : value}
          inputValue={local.draft}
          format={inputFormat}
          inputProps={inputProps}
          fitWidth={fitWidth}
          maxWFull={maxWFull}
          fitWidthFallback={`${Array.from(fallback).length}ch`}
          fitWidthFallbackText={fallback}
          prefix={before}
          suffixIcon={suffixIcon ?? <IconCalendar />}
          onChange={(event) => foundation.onInputChange((event.target as HTMLInputElement).value)}
          onPressEnter={foundation.onInputPressEnter}
          onClear={() => {
            if (!locked) foundation.onInputClear();
          }}
          onBlur={() => form.eventHandlers?.onBlur?.()}
        />
      )}
    </DatePickerContext.Provider>
  );
}
