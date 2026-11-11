import { createInputLabelFoundation } from '@sdata/web-core/input-label/foundation';
import { createLegacyInputFoundation } from '@sdata/web-core/text-input/legacy';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { InputTagProps } from '../input-tag/index.js';
import type { SelectViewValue } from './select-view.js';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { Ellipsis } from '../ellipsis/index.js';
import { useFormItem } from '../form/context.js';
import { useAfterRender } from './use-after-render.js';
import { useFitWidth } from './use-fit-width.js';

export interface InputLabelProps extends Omit<
  InputTagProps,
  | 'value'
  | 'defaultValue'
  | 'defaultInputValue'
  | 'allowClear'
  | 'maxTagCount'
  | 'formatTag'
  | 'uniqueValue'
  | 'fieldNames'
  | 'tagNowrap'
  | 'disabledInput'
  | 'renderTag'
  | 'onValueChange'
  | 'onChange'
  | 'onPressEnter'
  | 'onRemove'
  | 'onClear'
  | 'readonly'
  | 'retainInputValue'
> {
  value?: SelectViewValue;
  enabledInput?: boolean;
  formatLabel?: (data?: SelectViewValue) => string;
  retainInputValue?: boolean;
  renderLabel?: (data: SelectViewValue) => React.ReactNode;
}

export function InputLabel(props: InputLabelProps) {
  const {
    value,
    inputValue = '',
    enabledInput = false,
    formatLabel,
    retainInputValue: _retainInputValue,
    placeholder,
    disabled: _disabled,
    baseCls,
    size: _size,
    error: _error,
    focused,
    uninjectFormItemContext = false,
    inputAttrs,
    fitWidth = false,
    maxWFull = true,
    prefix: before,
    suffix,
    renderLabel,
    onInputValueChange: _onInputValueChange,
    onFocus: _onFocus,
    onBlur: _onBlur,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    onBeforeInput,
    onInvalid,
    onReset,
    onSubmit,
    onCopy,
    onCut,
    onPaste,
    onSelect,
    onInput,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    name,
    pattern,
    required,
    ref,
    className,
    style,
    onMouseDown,
    ...attrs
  } = props;
  const defaultPrefix = usePrefix('input-label');
  const prefix = baseCls ?? defaultPrefix;
  const config = useConfig();
  const form = useFormItem({ ...props, uninject: uninjectFormItemContext });
  const input = useRef<HTMLInputElement | null>(null);
  const [, render] = useState(0);
  const state = useRef({ value: '', focused: false, composition: false, compositionValue: '' });
  const live = useRef({ props, form, inputValue });
  live.current = { props, form, inputValue };
  const afterRender = useAfterRender();
  const refresh = () => render((version) => version + 1);
  const [inputFoundation] = useState(() =>
    createLegacyInputFoundation(
      {
        get input() {
          return input.current ?? undefined;
        },
        get modelValue() {
          return live.current.inputValue;
        },
        get computedValue() {
          return live.current.inputValue;
        },
        get eventHandlers() {
          return live.current.form.eventHandlers;
        },
        get value() {
          return state.current.value;
        },
        set value(value) {
          state.current.value = value;
          refresh();
        },
        get focused() {
          return state.current.focused;
        },
        set focused(value) {
          state.current.focused = value;
          refresh();
        },
        get isComposition() {
          return state.current.composition;
        },
        set isComposition(value) {
          state.current.composition = value;
          refresh();
        },
        get compositionValue() {
          return state.current.compositionValue;
        },
        set compositionValue(value) {
          state.current.compositionValue = value;
          refresh();
        },
      },
      {
        eventName: 'inputValueChange',
        afterRender: (callback) => {
          void afterRender().then(callback);
        },
        emit(name, ...args) {
          if (name === 'inputValueChange')
            live.current.props.onInputValueChange?.(args[0] as string, args[1] as Event);
          else if (name === 'focus') live.current.props.onFocus?.(args[0] as FocusEvent);
          else if (name === 'blur') live.current.props.onBlur?.(args[0] as FocusEvent);
        },
      },
    ),
  );
  const foundation = createInputLabelFoundation(
    { modelValue: value, enabledInput, placeholder, formatLabel },
    { focused: state.current.focused, inputValue },
  );
  const fit = useFitWidth(input, fitWidth, foundation.getFitWidthText(), '4ch');
  const fitStyle = fitWidth
    ? { flex: `0 1 ${fit.value}`, width: fit.value, minWidth: 0 }
    : undefined;
  useLayoutEffect(() => inputFoundation.syncInput(inputValue), [inputFoundation, inputValue]);
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return input.current;
      },
      focus() {
        input.current?.focus();
      },
      blur() {
        input.current?.blur();
      },
    }),
    [],
  );
  const native = {
    onKeyUp,
    onKeyPress,
    onBeforeInput,
    onInvalid,
    onReset,
    onSubmit,
    onCopy,
    onCut,
    onPaste,
    onSelect,
    onInput,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    name,
    pattern,
    required,
    ...inputAttrs,
  };
  return (
    <span
      {...attrs}
      className={[
        prefix,
        `${prefix}-size-${form.mergedSize ?? config.size ?? 'medium'}`,
        enabledInput && `${prefix}-search`,
        (focused ?? state.current.focused) && `${prefix}-focus`,
        form.mergedDisabled && `${prefix}-disabled`,
        form.mergedError && `${prefix}-error`,
        fitWidth && `${prefix}-fit-width`,
        maxWFull && `${prefix}-max-w-full`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...fit.style, ...style }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        inputFoundation.handleMousedown(event.nativeEvent);
      }}
    >
      {before != null && <span className={`${prefix}-prefix`}>{before}</span>}
      <input
        {...native}
        ref={input}
        defaultValue={inputValue}
        className={[
          `${prefix}-input`,
          !foundation.getShowInput() && `${prefix}-input-hidden`,
          native.className,
        ]
          .filter(Boolean)
          .join(' ')}
        readOnly={!enabledInput}
        placeholder={foundation.getPlaceholder()}
        disabled={form.mergedDisabled}
        style={{ ...fitStyle, ...native.style }}
        onInput={(event) => {
          native.onInput?.(event);
          inputFoundation.handleInput(event.nativeEvent);
        }}
        onKeyDown={(event) => {
          native.onKeyDown?.(event);
          onKeyDown?.(event.nativeEvent);
        }}
        onFocus={(event) => {
          native.onFocus?.(event);
          inputFoundation.handleFocus(event.nativeEvent);
        }}
        onBlur={(event) => {
          native.onBlur?.(event);
          inputFoundation.handleBlur(event.nativeEvent);
        }}
        onCompositionStart={(event) => {
          native.onCompositionStart?.(event);
          inputFoundation.handleComposition(event.nativeEvent);
        }}
        onCompositionUpdate={(event) => {
          native.onCompositionUpdate?.(event);
          inputFoundation.handleComposition(event.nativeEvent);
        }}
        onCompositionEnd={(event) => {
          native.onCompositionEnd?.(event);
          inputFoundation.handleComposition(event.nativeEvent);
        }}
      />
      <span
        className={[`${prefix}-value`, foundation.getShowInput() && `${prefix}-value-hidden`]
          .filter(Boolean)
          .join(' ')}
        style={fitStyle}
      >
        {value && (
          <Ellipsis style={{ width: '100%' }}>
            {renderLabel ? renderLabel(value) : foundation.formatLabel()}
          </Ellipsis>
        )}
      </span>
      {suffix != null && <span className={`${prefix}-suffix`}>{suffix}</span>}
    </span>
  );
}
