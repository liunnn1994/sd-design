import type {
  InputNumberOptions,
  InputNumberValue,
  InputNumberValueMode,
  InputNumberChangeHandler,
  InputNumberInputHandler,
} from '@sdata/web-core/input-number/types';
import type { ReactNode, Ref } from 'react';

import {
  configureInputNumberPrecision,
  createInputNumberData,
  getInitialInputNumberMode,
} from '@sdata/web-core/input-number/data';
import { createInputNumberFoundation } from '@sdata/web-core/input-number/foundation';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '../button/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { Input, type InputInstance, type InputProps } from '../input/index.js';
import { useI18n } from '../locale/index.js';

export type {
  InputNumberValue,
  InputNumberParser,
  InputNumberPropFormatter,
  InputNumberFormatter,
  InputNumberChangeHandler,
  InputNumberInputHandler,
} from '@sdata/web-core/input-number/types';
export interface InputNumberInstance {
  readonly inputRef: InputInstance | null;
  focus(): void;
  blur(): void;
}
export interface InputNumberProps
  extends
    Omit<
      InputProps,
      | 'value'
      | 'defaultValue'
      | 'onValueChange'
      | 'onInput'
      | 'onChange'
      | 'onClear'
      | 'ref'
      | 'type'
      | 'fitWidthFallback'
      | 'maxLength'
      | 'showWordLimit'
      | 'wordLength'
      | 'wordSlice'
      | 'onPressEnter'
    >,
    Partial<Omit<InputNumberOptions, 'modelValue'>> {
  value?: InputNumberValue;
  mode?: 'embed' | 'button';
  hideButton?: boolean;
  plus?: ReactNode;
  minus?: ReactNode;
  onValueChange?: (value: InputNumberValue) => void;
  onChange?: InputNumberChangeHandler;
  onInput?: InputNumberInputHandler;
  onClear?: (event: Event) => void;
  ref?: Ref<InputNumberInstance>;
}

export function InputNumber(props: InputNumberProps) {
  const {
    value,
    defaultValue,
    mode = 'embed',
    precision,
    step = 1,
    min = -Infinity,
    max = Infinity,
    formatter,
    parser,
    stringMode = false,
    modelEvent = 'change',
    readonly = false,
    hideButton = false,
    plus,
    minus,
    onValueChange: _onValueChange,
    onInput: _onInput,
    onChange: _onChange,
    onClear: _onClear,
    onBlur: _onBlur,
    onKeyDown: _onKeyDown,
    prepend,
    append,
    suffix,
    className,
    ref,
    inputAttrs,
    ...inputProps
  } = props;
  const form = useFormItem(props);
  const prefix = usePrefix('input-number');
  const config = useConfig();
  const size = form.mergedSize ?? config.size ?? 'medium';
  const icon = usePrefix('icon');
  const { t } = useI18n();
  const input = useRef<InputInstance>(null);
  const current = useRef({ props, form });
  current.current = { props, form };
  const [, render] = useState(0);
  const options = useRef<InputNumberOptions>({ stringMode, step, min, max, readonly, modelEvent });
  Object.assign(options.current, {
    modelValue: value,
    defaultValue,
    stringMode,
    step,
    min,
    max,
    precision,
    formatter,
    parser,
    readonly,
    modelEvent,
  });
  const [model] = useState(() => {
    configureInputNumberPrecision();
    const state = {
      inner: '',
      raw: '',
      mode: getInitialInputNumberMode(options.current),
      min: false,
      max: false,
    };
    const data = createInputNumberData(options.current, {
      get precision(): number | undefined {
        return data.getPrecision();
      },
      get mode() {
        return state.mode;
      },
      get raw() {
        return state.raw;
      },
    });
    state.inner = data.getDisplayValue(value ?? defaultValue);
    state.raw = data.getRawText(value ?? defaultValue, state.inner);
    state.min = data.compareToBoundary(data.getNumberValue(state.inner), min) <= 0;
    state.max = data.compareToBoundary(data.getNumberValue(state.inner), max) >= 0;
    const refresh = () => render((version) => version + 1);
    const foundation = createInputNumberFoundation({
      options: options.current,
      data,
      get inner() {
        return state.inner;
      },
      get raw() {
        return state.raw;
      },
      get number() {
        return data.getNumberValue(state.inner);
      },
      get minReached() {
        return state.min;
      },
      get maxReached() {
        return state.max;
      },
      setInner: (value) => {
        state.inner = value;
        refresh();
      },
      setRaw: (value) => {
        state.raw = value;
        refresh();
      },
      setMinReached: (value) => {
        state.min = value;
        refresh();
      },
      setMaxReached: (value) => {
        state.max = value;
        refresh();
      },
      setMode: (value: InputNumberValueMode) => {
        state.mode = value;
      },
      isDisabled: () => current.current.form.mergedDisabled,
      isMouseEvent: (event) => event instanceof MouseEvent,
      focus: () => input.current?.focus(),
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      clearTimer: (timer) => window.clearTimeout(timer),
      dispatchRepeat: (event) => (event.target as HTMLElement).dispatchEvent(event),
      onUpdate: (value) => current.current.props.onValueChange?.(value),
      onChange: (value, event) => current.current.props.onChange?.(value, event),
      onInput: (value, text, event) => current.current.props.onInput?.(value, text, event),
      onBlur: (event) => current.current.props.onBlur?.(event),
      onClear: (event) => current.current.props.onClear?.(event),
      onKeydown: (event) => current.current.props.onKeyDown?.(event),
      onFormChange: (event) => current.current.form.eventHandlers?.onChange?.(event),
    });
    return { state, data, foundation };
  });
  const { state, data, foundation } = model;
  const previous = useRef({ value, formatter, parser, min, max });
  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = { value, formatter, parser, min, max };
    if (old.formatter !== formatter || old.parser !== parser)
      foundation.syncFormatting(formatter, old.parser);
    if (old.min !== min || old.max !== max) foundation.syncBounds();
    if (!Object.is(old.value, value)) foundation.syncModel(value);
  });
  useLayoutEffect(() => () => foundation.clearRepeatTimer(), [foundation]);
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return input.current;
      },
      focus: () => input.current?.focus(),
      blur: () => input.current?.blur(),
    }),
    [],
  );
  const glyph = (path: string) => (
    <svg
      className={icon}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
  const stepButton = (method: 'plus' | 'minus', embedded: boolean) => {
    const disabled = form.mergedDisabled || (method === 'plus' ? state.max : state.min);
    const attributes = {
      'aria-label': t(method === 'plus' ? 'a11y.increase' : 'a11y.decrease'),
      'tabIndex': -1,
      disabled,
      'className': `${prefix}-step-button${embedded && disabled ? ` ${prefix}-step-button-disabled` : ''}`,
      'onMouseDown': (event: React.MouseEvent<HTMLButtonElement>) =>
        foundation.handleStepButton(event.nativeEvent, method, true),
      'onMouseUp': foundation.clearRepeatTimer,
      'onMouseLeave': foundation.clearRepeatTimer,
    };
    return embedded ? (
      <button {...attributes} type="button">
        {(method === 'plus' ? plus : minus) ??
          glyph(method === 'plus' ? 'm12 30 12-12 12 12' : 'm12 18 12 12 12-12')}
      </button>
    ) : (
      <Button
        {...attributes}
        size={size}
        icon={glyph(method === 'plus' ? 'M8 24h32M24 8v32' : 'M8 24h32')}
      />
    );
  };
  const emitted = foundation.getEmittedValue();
  return (
    <Input
      {...inputProps}
      key={mode}
      ref={input}
      type="text"
      value={state.inner}
      size={size}
      disabled={form.mergedDisabled}
      readonly={readonly}
      fitWidthFallback="2ch"
      className={[
        prefix,
        `${prefix}-mode-${mode}`,
        `${prefix}-size-${size}`,
        readonly && `${prefix}-readonly`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      inputAttrs={{
        'role': 'spinbutton',
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': emitted === '' || emitted == null ? undefined : (emitted as number),
        'aria-valuetext':
          formatter && data.getNumberValue(state.inner) !== undefined ? state.inner : undefined,
        ...inputAttrs,
      }}
      onInput={foundation.handleInput}
      onChange={foundation.handleChange}
      onClear={foundation.handleClear}
      onBlur={foundation.handleBlur}
      onKeyDown={foundation.onKeyDown}
      prepend={mode === 'embed' || hideButton ? prepend : stepButton('minus', false)}
      append={mode === 'embed' || hideButton ? append : stepButton('plus', false)}
      suffix={
        mode === 'button' || hideButton ? (
          suffix
        ) : readonly ? undefined : (
          <>
            {suffix != null && suffix !== false && suffix !== '' && (
              <div className={`${prefix}-suffix`}>{suffix}</div>
            )}
            <div className={`${prefix}-step`}>
              {stepButton('plus', true)}
              {stepButton('minus', true)}
            </div>
          </>
        )
      }
    />
  );
}
export default InputNumber;
