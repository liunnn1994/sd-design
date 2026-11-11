import type { ComponentRef as ReactComponentRef } from 'react';
import type { CSSProperties, MouseEvent } from 'react';

import { createSwitchFoundation } from '@sdata/web-core/switch/foundation';
import { useEffect, useRef, useState } from 'react';

import type { SwitchProps } from './types.js';

import { hasContent } from '../_shared/has-content.js';
import { LoadingIcon } from '../_shared/loading-icon.js';
import { usePrefix, useConfig } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';

export type { SwitchProps, SwitchBeforeChange, SwitchValue, SwitchChangeHandler } from './types.js';

export function Switch(props: SwitchProps) {
  const prefix = usePrefix('switch');
  const config = useConfig();
  const formItem = useFormItem(props);
  const formState = useRef(formItem);
  formState.current = formItem;
  const inheritedSize = formItem.mergedSize ?? config.size;
  const {
    value,
    defaultChecked = false,
    checkedValue = true,
    uncheckedValue = false,
    loading,
    autoLoading,
    type = 'circle',
    size = inheritedSize === 'small' || inheritedSize === 'mini' ? 'small' : 'medium',
    checkedColor,
    uncheckedColor,
    checkedText,
    uncheckedText,
    checkedIcon,
    uncheckedIcon,
    beforeChange: _beforeChange,
    onChange: _onChange,
    disabled: _disabled,
    className,
    style,
    onClick,
    onFocus,
    onBlur,
    children: _children,
    ...attributes
  } = props;
  const disabled = formItem.mergedDisabled;
  const [, render] = useState(0);
  const current = useRef(props);
  current.current = props;
  const state = useRef({
    internal: defaultChecked ? checkedValue : uncheckedValue,
    before: false,
    auto: false,
    mounted: true,
  });
  const refresh = () => {
    if (state.current.mounted) render((count) => count + 1);
  };
  const [foundation] = useState(() =>
    createSwitchFoundation<MouseEvent<HTMLButtonElement>>({
      getCheckedValue: () => current.current.checkedValue ?? true,
      getUncheckedValue: () => current.current.uncheckedValue ?? false,
      getModel: () => current.current.value,
      getInternal: () => state.current.internal,
      setInternal: (next) => {
        state.current.internal = next;
        refresh();
      },
      isDisabled: () => !state.current.mounted || formState.current.mergedDisabled,
      isLoading: () => state.current.before || state.current.auto || !!current.current.loading,
      isAutoLoading: () => !!current.current.autoLoading,
      hasLoadingProp: () => Object.hasOwn(current.current, 'loading'),
      hasModelProp: () => Object.hasOwn(current.current, 'value'),
      getBeforeChange: () => current.current.beforeChange,
      setBeforeLoading: (next) => {
        state.current.before = next;
        refresh();
      },
      setAutoLoading: (next) => {
        state.current.auto = next;
        refresh();
      },
      onUpdate: () => {},
      onChange: (next, event) => current.current.onChange?.(next, event),
      onFormChange: () => formState.current.eventHandlers?.onChange?.(),
    }),
  );
  useEffect(() => {
    state.current.mounted = true;
    return () => {
      state.current.mounted = false;
    };
  }, []);
  const previousValue = useRef(value);
  useEffect(() => {
    if (!Object.is(previousValue.current, value)) {
      foundation.syncModel(value);
      foundation.resetAutoLoading();
      previousValue.current = value;
    }
  }, [value, foundation]);
  const hasLoading = Object.hasOwn(props, 'loading');
  const hasValue = Object.hasOwn(props, 'value');
  useEffect(() => foundation.syncAutoLoading(), [autoLoading, hasLoading, hasValue, foundation]);
  const checked = foundation.isChecked();
  const busy = !!loading || state.current.before || state.current.auto;
  const color = checked ? checkedColor : uncheckedColor;
  const colorStyle: CSSProperties & { '--custom-color'?: string } =
    type === 'line' ? { '--custom-color': color } : { backgroundColor: color };
  const text = checked ? checkedText : uncheckedText;
  return (
    <button
      id={formItem.formItemCtx?.fieldId}
      {...attributes}
      type="button"
      role="switch"
      disabled={disabled}
      onFocus={(event) => {
        onFocus?.(event);
        formItem.eventHandlers?.onFocus?.(event.nativeEvent);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        formItem.eventHandlers?.onBlur?.(event.nativeEvent);
      }}
      aria-checked={checked}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      className={[
        `${prefix}`,
        `${prefix}-type-${type}`,
        size === 'small' && `${prefix}-small`,
        checked && `${prefix}-checked`,
        disabled && `${prefix}-disabled`,
        busy && `${prefix}-loading`,
        type === 'line' && (checkedColor || uncheckedColor) && `${prefix}-custom-color`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...colorStyle, ...style }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void foundation.click(event);
      }}
    >
      <span className={`${prefix}-handle`}>
        <span className={`${prefix}-handle-icon`}>
          {busy ? <LoadingIcon /> : checked ? checkedIcon : uncheckedIcon}
        </span>
      </span>
      {type !== 'line' &&
        size !== 'small' &&
        (hasContent(checkedText) || hasContent(uncheckedText)) && (
          <>
            <span className={`${prefix}-text-holder`}>{text}</span>
            <span className={`${prefix}-text`}>{text}</span>
          </>
        )}
    </button>
  );
}

export default Switch;

export type SwitchInstance = ReactComponentRef<typeof Switch>;
