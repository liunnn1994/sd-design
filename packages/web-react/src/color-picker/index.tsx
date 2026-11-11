import type { ColorModes } from '@sdata/web-core/color-picker/types';
import type { ComponentRef as ReactComponentRef } from 'react';

import { createColorPicker, getColorPreviewStyle } from '@sdata/web-core/color-picker/foundation';
import {
  getColorObject,
  normalizeFormat,
  parseColorState,
} from '@sdata/web-core/color-picker/utils';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { ColorPickerProps } from './types.js';

import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Input } from '../input/index.js';
import { Tooltip } from '../tooltip/index.js';
import { Trigger } from '../trigger/index.js';
import { ColorPanel } from './panel.js';

export type * from './types.js';
const defaultModes: ColorModes = ['monochrome'];

export function ColorPicker(props: ColorPickerProps) {
  const {
    value: controlledValue,
    defaultValue = '',
    borderless = false,
    clearable = false,
    colorModes = defaultModes,
    enableMultipleGradient = true,
    format = 'RGB',
    size = 'medium',
    enableAlpha = false,
    showPrimaryColorPreview = true,
    inputProps,
    recentColors,
    defaultRecentColors = [],
    swatchColors,
    disabled = false,
    readonly = false,
    hideTrigger = false,
    triggerProps,
    floatingOptions,
    children,
    renderTrigger,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onPopupVisibleChange: _onPopupVisibleChange,
    onClear: _onClear,
    onPaletteBarChange,
    onRecentColorsChange: _onRecentColorsChange,
    className,
    onClick,
    ...attrs
  } = props;
  const prefix = usePrefix('color-picker');
  const config = useConfig();
  const tip = useReadonlyTip(readonly, disabled);
  const [, render] = useReducer((value: number) => value + 1, 0);
  const [local] = useState(() => ({
    value: defaultValue,
    draft: null as string | null,
    recent: Array.isArray(defaultRecentColors) ? defaultRecentColors : [],
    popup: triggerProps?.defaultPopupVisible ?? false,
  }));
  const value = controlledValue ?? local.value;
  const normalizedFormat = normalizeFormat(format, enableAlpha);
  const state = parseColorState(value, colorModes);
  const live = useRef({
    props,
    value,
    normalizedFormat,
    state,
    colorModes,
    disabled,
    readonly,
    enableAlpha,
  });
  live.current = {
    props,
    value,
    normalizedFormat,
    state,
    colorModes,
    disabled,
    readonly,
    enableAlpha,
  };
  const [foundation] = useState(() =>
    createColorPicker({
      get props() {
        const current = live.current;
        return {
          modelValue: current.props.value,
          recentColors: current.props.recentColors,
          disabled: current.disabled,
          readonly: current.readonly,
          colorModes: current.colorModes,
          enableAlpha: current.enableAlpha,
        };
      },
      get value() {
        return live.current.value;
      },
      get format() {
        return live.current.normalizedFormat;
      },
      get state() {
        return live.current.state;
      },
      get draft() {
        return local.draft;
      },
      set draft(next) {
        local.draft = next;
        render();
      },
      setInner(next) {
        local.value = next;
        render();
      },
      setRecent(next) {
        local.recent = next;
        render();
      },
      setPopup(next) {
        local.popup = next;
        render();
      },
      onUpdate: (next) => live.current.props.onValueChange?.(next),
      onChange: (next, context) => live.current.props.onChange?.(next, context),
      onClear: (context) => live.current.props.onClear?.(context),
      onRecentChange: (next) => live.current.props.onRecentColorsChange?.(next),
      onPopupChange: (visible, display) =>
        live.current.props.onPopupVisibleChange?.(visible, display),
    }),
  );
  const previousValue = useRef(value);
  useLayoutEffect(() => {
    if (previousValue.current !== value) {
      previousValue.current = value;
      foundation.syncValue();
    }
  }, [foundation, value]);
  const displayValue = foundation.display();
  const popupVisible = triggerProps?.popupVisible ?? local.popup;
  const previewStyle = getColorPreviewStyle(state);
  const panel = (
    <ColorPanel
      value={value}
      colorModes={colorModes}
      enableMultipleGradient={enableMultipleGradient}
      recentColors={
        recentColors === null || recentColors === false || Array.isArray(recentColors)
          ? recentColors
          : local.recent
      }
      swatchColors={
        swatchColors !== undefined ? swatchColors : (config.colorPicker?.swatchColors ?? [])
      }
      disabled={disabled || Boolean(readonly)}
      enableAlpha={enableAlpha}
      format={normalizedFormat}
      showPrimaryColorPreview={showPrimaryColorPreview}
      onChange={foundation.change}
      onRecentColorsChange={foundation.recent}
      onPaletteBarChange={onPaletteBarChange}
      rootProps={hideTrigger ? { ...attrs, className, onClick } : undefined}
    />
  );
  if (hideTrigger) return panel;
  const trigger = renderTrigger
    ? renderTrigger({
        value,
        displayValue,
        color: getColorObject(state),
        popupVisible,
        disabled,
        readonly: Boolean(readonly),
        format: normalizedFormat,
        previewStyle,
      })
    : (children ?? (
        <div
          {...attrs}
          className={[
            prefix,
            `${prefix}-size-${size}`,
            disabled && `${prefix}-disabled`,
            readonly && `${prefix}-readonly`,
            borderless && `${prefix}-borderless`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={(event) => {
            onClick?.(event);
            tip.show();
          }}
        >
          <Input
            {...inputProps}
            className={[`${prefix}-trigger-input`, inputProps?.className].filter(Boolean).join(' ')}
            size={size}
            allowClear={clearable}
            disabled={disabled}
            readonly={readonly}
            value={displayValue}
            inputAttrs={{
              ...inputProps?.inputAttrs,
              'aria-haspopup': 'dialog',
              'aria-expanded': popupVisible,
            }}
            onInput={(next, event) => {
              foundation.input(next);
              inputProps?.onInput?.(next, event);
            }}
            onChange={(next, event) => {
              foundation.commit(next);
              inputProps?.onChange?.(next, event);
            }}
            onClear={(event) => {
              foundation.clear(event);
              inputProps?.onClear?.(event);
            }}
            prefix={<div className={`${prefix}-preview`} style={previewStyle} />}
          />
        </div>
      ));
  return (
    <Tooltip popupVisible={tip.visible} content={tip.text} position="top">
      <Trigger
        trigger="click"
        position="bl"
        disabled={disabled || Boolean(readonly)}
        popupOffset={4}
        animationName="slide-dynamic-origin"
        {...triggerProps}
        floatingOptions={floatingOptions ?? triggerProps?.floatingOptions}
        content={panel}
        onPopupVisibleChange={(visible) => {
          triggerProps?.onPopupVisibleChange?.(visible);
          foundation.popup(visible);
        }}
      >
        {trigger}
      </Trigger>
    </Tooltip>
  );
}

export default ColorPicker;

export type ColorPickerInstance = ReactComponentRef<typeof ColorPicker>;
