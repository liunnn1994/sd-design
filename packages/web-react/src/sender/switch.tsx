import { createSenderSwitch } from '@sdata/web-core/sender/controls';
import { useContext, useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { SenderSwitchProps } from './types.js';

import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { SenderContext } from './context.js';

export function SenderSwitch(props: SenderSwitchProps) {
  const {
    value: _value,
    modelValue: _model,
    defaultValue = false,
    disabled,
    loading,
    onValueChange: _update,
    onChange: _change,
    children,
    slots,
    classNames = {},
    styles = {},
    className,
    style,
    ...attrs
  } = props;
  const context = useContext(SenderContext);
  const ownPrefix = usePrefix('sender'),
    prefix = context?.prefix ?? ownPrefix,
    cls = `${prefix}-switch`;
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const current = useRef(props);
  current.current = props;
  const inner = useRef(defaultValue);
  const [foundation] = useState(() =>
    createSenderSwitch(
      {
        get props() {
          return {
            ...current.current,
            modelValue: Object.hasOwn(current.current, 'value')
              ? current.current.value
              : current.current.modelValue,
          };
        },
        get controlled() {
          return (
            Object.hasOwn(current.current, 'value') || Object.hasOwn(current.current, 'modelValue')
          );
        },
        get checked(): boolean {
          return foundation.checked();
        },
        get innerChecked() {
          return inner.current;
        },
        set innerChecked(value) {
          if (inner.current !== value) {
            inner.current = value;
            refresh();
          }
        },
      },
      {
        update: (value) => current.current.onValueChange?.(value),
        change: (value) => current.current.onChange?.(value),
      },
    ),
  );
  useLayoutEffect(() => foundation.syncDefault(defaultValue), [foundation, defaultValue]);
  const checked = foundation.checked();
  return (
    <div
      {...attrs}
      className={[
        prefix,
        cls,
        context?.classNames?.switch,
        classNames.root,
        checked && `${cls}-checked`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...context?.styles?.switch, ...styles.root, ...style }}
    >
      <Button
        type="outline"
        disabled={disabled}
        loading={loading}
        className={[`${cls}-content`, classNames.content].filter(Boolean).join(' ')}
        style={styles.content}
        onClick={foundation.change}
        icon={
          slots?.icon ? (
            <span className={classNames.icon} style={styles.icon}>
              {slots.icon()}
            </span>
          ) : undefined
        }
      >
        <span className={classNames.title} style={styles.title}>
          {typeof children === 'function'
            ? children({ checked })
            : (children ?? (checked ? slots?.checked?.() : slots?.unchecked?.()))}
        </span>
      </Button>
    </div>
  );
}
