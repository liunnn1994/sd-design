import type { ReactElement } from 'react';

import { dayjs, getDateValue } from '@sdata/web-core/_utils/date';
import {
  getColumnsFromFormat,
  getFormattedValue,
  resolveTimeFormat,
} from '@sdata/web-core/time-picker/values';
import { useImperativeHandle, useRef } from 'react';

import type { TimePickerProps } from './types.js';

import { PickerInput, type PickerInputInstance } from '../_shared/picker-input.js';
import { usePrefix } from '../config-provider/index.js';
import { IconClockCircle } from '../icon/icon-clock-circle.js';
import { useI18n } from '../locale/index.js';
import { Trigger } from '../trigger/index.js';
import { TimePanel } from './panel.js';
import { TimeRangePanel } from './range-panel.js';
import { useTimePicker } from './use-time-picker.js';
export type * from './types.js';

export function TimePicker(props: TimePickerProps) {
  const {
    ref,
    type = 'time',
    value: _value,
    defaultValue: _defaultValue,
    format: formatProp = 'HH:mm:ss',
    use12Hours,
    disabled: _disabled,
    readonly,
    error,
    size,
    allowClear = true,
    placeholder,
    position = 'bl',
    popupVisible: _popupVisible,
    defaultPopupVisible: _defaultPopupVisible,
    popupContainer,
    triggerProps,
    floatingOptions,
    unmountOnClose,
    fitWidth,
    maxWFull,
    prefix: before,
    suffixIcon,
    extra,
    inputProps,
    renderTrigger,
    children,
    disableConfirm,
    step,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabledOptions,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onSelect: _onSelect,
    onClear: _onClear,
    onPopupVisibleChange: _onPopupVisibleChange,
    onUpdatePopupVisible: _onUpdatePopupVisible,
    ...attrs
  } = props;
  const range = type === 'time-range';
  const format = resolveTimeFormat(formatProp, undefined, use12Hours);
  const computedUse12Hours = !!(use12Hours || getColumnsFromFormat(format).use12Hours);
  const input = useRef<PickerInputInstance>(null);
  useImperativeHandle(
    ref,
    () => ({ focus: (index) => input.current?.focus(index), blur: () => input.current?.blur() }),
    [],
  );
  const { foundation, form, value, visible, local, setFocusedIndex } = useTimePicker(
    props,
    format,
    input,
  );
  const prefix = usePrefix('timepicker');
  const { t } = useI18n();
  const placeholderValue =
    placeholder ??
    (range
      ? [t('datePicker.rangePlaceholder.time.0'), t('datePicker.rangePlaceholder.time.1')]
      : t('datePicker.placeholder.time'));
  const panelProps = {
    visible,
    format,
    use12Hours: computedUse12Hours,
    step,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabledOptions,
    hideFooter: disableConfirm,
    disabled: form.mergedDisabled || !!readonly,
    extra,
  };
  const content = (
    <div className={`${prefix}-container`} onClick={() => input.current?.focus(local.index)}>
      {range ? (
        <TimeRangePanel
          {...panelProps}
          value={Array.isArray(local.panel) ? local.panel : undefined}
          displayIndex={local.index}
          onSelect={foundation.onPanelSelect}
          onConfirm={(next) => {
            if (next) foundation.onPanelConfirm(next);
          }}
          onDisplayIndexChange={(index) => {
            setFocusedIndex(index);
            input.current?.focus(index);
          }}
        />
      ) : (
        <TimePanel
          {...panelProps}
          value={Array.isArray(local.panel) ? undefined : local.panel}
          onSelect={foundation.onPanelSelect}
          onConfirm={foundation.onPanelConfirm}
        />
      )}
    </div>
  );
  const wrap = (element: ReactElement) => (
    <Trigger
      trigger="click"
      animationName="slide-dynamic-origin"
      autoFitTransformOrigin
      clickToClose={false}
      position={position}
      disabled={form.mergedDisabled || !!readonly}
      popupOffset={4}
      popupVisible={visible}
      preventFocus
      unmountOnClose={unmountOnClose}
      popupContainer={popupContainer}
      {...triggerProps}
      floatingOptions={floatingOptions ?? triggerProps?.floatingOptions}
      ariaHasPopup="dialog"
      content={content}
      onPopupVisibleChange={(next) => {
        foundation.onPanelVisibleChange(next);
        triggerProps?.onPopupVisibleChange?.(next);
      }}
    >
      {element}
    </Trigger>
  );
  const formattedValue = getFormattedValue(value, format);
  const custom =
    renderTrigger?.({
      value: formattedValue,
      date: getDateValue(value),
      displayValue: formattedValue ?? (range ? [] : ''),
      inputValue: local.draft,
      popupVisible: visible,
      disabled: form.mergedDisabled,
      readonly: !!readonly,
      range,
    }) ?? children;
  if (custom) return wrap(custom);
  const fallbackText = dayjs(new Date(2000, 0, 1)).format(format);
  return (
    <PickerInput
      ref={input}
      renderRoot={wrap}
      rootProps={attrs}
      range={range}
      value={local.panel}
      inputValue={local.draft}
      format={format}
      focused={visible}
      focusedIndex={local.index}
      onFocusedIndexChange={setFocusedIndex}
      size={size}
      disabled={form.mergedDisabled}
      readonly={readonly}
      error={error}
      allowClear={allowClear && !readonly}
      placeholder={placeholderValue}
      fitWidth={fitWidth}
      maxWFull={maxWFull}
      fitWidthFallback={`${Array.from(fallbackText).length}ch`}
      fitWidthFallbackText={fallbackText}
      prefix={before}
      suffixIcon={suffixIcon ?? <IconClockCircle />}
      inputProps={inputProps}
      onChange={(event) => {
        const text = (event.target as HTMLInputElement).value;
        if (range) foundation.onRangeInputChange(text);
        else foundation.onInputChange(text);
      }}
      onPressEnter={range ? foundation.onRangeInputPressEnter : foundation.onInputPressEnter}
      onClear={(event) => {
        event.stopPropagation();
        foundation.onClear();
      }}
    />
  );
}
export default TimePicker;
