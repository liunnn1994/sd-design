import type { RangePickerTriggerSlotProps } from '@sdata/web-core/date-picker/types';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';

import { dayjs, getDateValue, getNow, toLocal } from '@sdata/web-core/_utils/date';
import { getReturnRangeValue } from '@sdata/web-core/date-picker/values';
import { getFormattedValue } from '@sdata/web-core/time-picker/values';
import { useImperativeHandle, useRef } from 'react';

import type { PickerInputInstance } from '../_shared/picker-input.js';
import type { PickerProps } from './picker.js';
import type { DatePickerStateOptions } from './use-date-picker.js';

import { PickerInput } from '../_shared/picker-input.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { IconCalendar } from '../icon/icon-calendar.js';
import { Trigger } from '../trigger/index.js';
import { DatePickerContext } from './context.js';
import { DateRangePickerPanel, type DateRangePickerPanelProps } from './range-picker-panel.js';
import { useDatePickerLocale } from './use-date-picker-locale.js';
import { useRangePicker, type RangePickerStateOptions } from './use-range-picker.js';

export interface RangePickerProps
  extends
    Omit<
      PickerProps,
      | keyof DatePickerStateOptions
      | 'placeholder'
      | 'inputProps'
      | 'renderCell'
      | 'renderTrigger'
      | 'renderPanel'
    >,
    Omit<RangePickerStateOptions, 'showConfirm'> {
  placeholder?: string[];
  inputProps?: ComponentPropsWithoutRef<'input'>[];
  separator?: ReactNode;
  renderCell?(date: Date, type: 'start' | 'end'): ReactNode;
  renderTrigger?(state: RangePickerTriggerSlotProps): ReactElement;
  renderPanel?(context: {
    component: typeof DateRangePickerPanel;
    props: DateRangePickerPanelProps;
  }): ReactNode;
}

export function RangePicker(props: RangePickerProps) {
  const config = useConfig();
  const {
    ref,
    locale,
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
    showNowBtn: _showNowBtn,
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
    separator = '-',
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
    exchangeTime: _exchangeTime,
    fixedTime: _fixedTime,
    clearRangeOnReselect: _clearRangeOnReselect,
    ...attrs
  } = props;
  const input = useRef<PickerInputInstance>(null);
  useImperativeHandle(
    ref,
    () => ({ focus: (index) => input.current?.focus(index), blur: () => input.current?.blur() }),
    [],
  );
  const state = useRangePicker(
    {
      ...props,
      showConfirm: showConfirmBtn,
      exchangeTime: (props.exchangeTime ?? true) && (config.exchangeTime ?? true),
    },
    input,
  );
  const { foundation, mode, format, panelValue, value, local, visible, disabledInputs, disabled } =
    state;
  const prefix = usePrefix('picker');
  const translate = useDatePickerLocale(locale, dayStartOfWeek);
  const panelProps: DateRangePickerPanelProps = {
    prefixCls: prefix,
    mode,
    format: state.parseFormat,
    value: panelValue,
    visible,
    hideTrigger,
    hideNotInViewDates,
    disabledDate,
    disabledTime,
    disabled: disabledInputs.map((disabled) => disabled || !!readonly),
    showTime,
    timePickerProps: { format, ...timePickerProps },
    utcOffset,
    timezone,
    shortcuts,
    shortcutsPosition,
    dayStartOfWeek,
    abbreviation,
    now: getNow(utcOffset, timezone),
    showConfirmBtn: state.needConfirm,
    confirmBtnDisabled: disabled || !!readonly || state.confirmDisabled,
    startHeaderProps: {
      headerValue: state.header.startValue,
      headerOperations: state.header.startOperations,
      headerIcons,
    },
    endHeaderProps: {
      headerValue: state.header.endValue,
      headerOperations: state.header.endOperations,
      headerIcons,
    },
    startHeaderMode: local.startHeaderMode,
    endHeaderMode: local.endHeaderMode,
    timePickerValue: state.time.value,
    footerValue: state.footerValue,
    extra,
    renderCell,
    onCellClick: foundation.onPanelCellClick,
    onCellMouseEnter: foundation.onPanelCellMouseEnter,
    onTimePickerSelect: foundation.onTimePickerSelect,
    onConfirm: foundation.onPanelConfirm,
    onShortcutClick: foundation.onPanelShortcutClick,
    onShortcutMouseEnter: previewShortcut ? foundation.onPanelShortcutMouseEnter : undefined,
    onShortcutMouseLeave: previewShortcut ? foundation.onPanelShortcutMouseLeave : undefined,
    onStartHeaderLabelClick: (mode) => state.setHeaderMode('start', mode),
    onEndHeaderLabelClick: (mode) => state.setHeaderMode('end', mode),
    onStartHeaderSelect: (date) => state.selectHeader('start', date),
    onEndHeaderSelect: (date) => state.selectHeader('end', date),
    rootProps: hideTrigger ? attrs : undefined,
  };
  const panel = renderPanel ? (
    renderPanel({ component: DateRangePickerPanel, props: panelProps })
  ) : (
    <DateRangePickerPanel {...panelProps} />
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
      disabled={disabled || !!readonly}
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
  const triggerValue = value.map((date) => (date ? toLocal(date, utcOffset, timezone) : undefined));
  const custom =
    renderTrigger?.({
      value: getReturnRangeValue(value, state.returnFormat, utcOffset, timezone),
      date: getDateValue(triggerValue),
      displayValue: getFormattedValue(triggerValue, format) ?? [],
      inputValue: local.draft,
      popupVisible: visible,
      disabled,
      disabledInputs,
      readonly: !!readonly,
    }) ?? children;
  const fallback = dayjs(new Date(2000, 0, 1)).format(format);
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
          range
          size={size}
          error={error}
          focused={visible}
          focusedIndex={local.index}
          onFocusedIndexChange={state.setFocusedIndex}
          disabled={disabledInputs}
          readonly={readonly || disabledInput}
          allowClear={(allowClear ?? config.allowClear ?? true) && !readonly}
          placeholder={
            placeholder ?? [
              translate(`datePicker.rangePlaceholder.${mode}.0`),
              translate(`datePicker.rangePlaceholder.${mode}.1`),
            ]
          }
          value={panelValue}
          inputValue={local.draft}
          format={format}
          inputProps={inputProps}
          fitWidth={fitWidth}
          maxWFull={maxWFull}
          fitWidthFallback={`${Array.from(fallback).length}ch`}
          fitWidthFallbackText={fallback}
          prefix={before}
          suffixIcon={suffixIcon ?? <IconCalendar />}
          separator={separator}
          onChange={(event) => foundation.onInputChange((event.target as HTMLInputElement).value)}
          onPressEnter={foundation.onInputPressEnter}
          onClear={() => {
            if (!disabled && !readonly) foundation.onInputClear();
          }}
        />
      )}
    </DatePickerContext.Provider>
  );
}
