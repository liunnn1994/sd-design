import type { CursorSelection } from '@sdata/web-core/text-input/cursor';
import type { TextInputOptions } from '@sdata/web-core/text-input/foundation';
import type { RefObject } from 'react';

import { createCursorFoundation } from '@sdata/web-core/text-input/cursor';
import { createTextInputFoundation } from '@sdata/web-core/text-input/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

import { useFormItem } from '../form/context.js';
import { useAfterRender } from './use-after-render.js';

export interface TextInputProps extends Partial<TextInputOptions> {
  value?: string | null;
  defaultValue?: string;
  size?: 'mini' | 'small' | 'medium' | 'large';
  disabled?: boolean;
  error?: boolean;
  onValueChange?: (value: string) => void;
  onInput?: (value: string, event: Event) => void;
  onChange?: (value: string, event: Event) => void;
  onClear?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onPressEnter?: (event: KeyboardEvent) => void;
}

export type TextInputEventNames =
  | 'onKeyUp'
  | 'onKeyPress'
  | 'onBeforeInput'
  | 'onInvalid'
  | 'onReset'
  | 'onSubmit'
  | 'onCopy'
  | 'onCut'
  | 'onPaste'
  | 'onCompositionStart'
  | 'onCompositionUpdate'
  | 'onCompositionEnd';

export function useTextInput(
  props: TextInputProps,
  element: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  kind: 'input' | 'textarea',
) {
  const form = useFormItem(props);
  const afterRender = useAfterRender();
  const restoring = useRef(false);
  const [, render] = useState(0);
  const state = useRef({
    inner: props.defaultValue ?? '',
    composing: false,
    compositionValue: '',
    focused: false,
  });
  const current = useRef({ props, form });
  current.current = { props, form };
  const refresh = () => render((version) => version + 1);
  const [cursor] = useState(() =>
    createCursorFoundation({
      get input() {
        return element.current ?? undefined;
      },
      selection: undefined as CursorSelection | undefined,
    }),
  );
  const getValue = () => current.current.props.value ?? state.current.inner;
  const [foundation] = useState((): ReturnType<typeof createTextInputFoundation> =>
    createTextInputFoundation(
      {
        get options() {
          return { ...current.current.props, maxLength: current.current.props.maxLength ?? 0 };
        },
        get value() {
          return getValue();
        },
        get valueLength(): number {
          return foundation.getLength(getValue());
        },
        get maxLength(): number {
          return foundation.getMaxLength();
        },
        get errorOnly(): boolean {
          return foundation.getErrorOnly();
        },
        get sliceLength(): number {
          return foundation.getSliceLength();
        },
        get composing() {
          return state.current.composing;
        },
        setInner(value) {
          state.current.inner = value;
          refresh();
        },
        setComposing(value) {
          state.current.composing = value;
          refresh();
        },
        setCompositionValue(value) {
          state.current.compositionValue = value;
          refresh();
        },
        setFocused(value) {
          state.current.focused = value;
          refresh();
        },
        keepControl() {
          restoring.current = true;
          cursor.recordCursor();
          void afterRender().then(() => {
            if (
              element.current &&
              !state.current.composing &&
              element.current.value !== getValue()
            ) {
              element.current.value = getValue();
              cursor.setCursor();
            }
            restoring.current = false;
          });
        },
        onUpdate: (value) => current.current.props.onValueChange?.(value),
        onInput: (value, event) => {
          current.current.props.onInput?.(value, event);
          current.current.form.eventHandlers?.onInput?.(event);
        },
        onChange: (value, event) => {
          current.current.props.onChange?.(value, event);
          current.current.form.eventHandlers?.onChange?.(event);
        },
        onClear: (event) => current.current.props.onClear?.(event),
        onFocus: (event) => {
          current.current.props.onFocus?.(event);
          current.current.form.eventHandlers?.onFocus?.(event);
        },
        onBlur: (event) => {
          current.current.props.onBlur?.(event);
          current.current.form.eventHandlers?.onBlur?.(event);
        },
        onEnter: (event) => current.current.props.onPressEnter?.(event),
      },
      kind,
    ),
  );
  const previous = useRef(props.value);
  useLayoutEffect(() => {
    if (!Object.is(previous.current, props.value)) {
      foundation.syncModel(props.value);
      previous.current = props.value;
    }
    if (
      element.current &&
      !restoring.current &&
      !state.current.composing &&
      element.current.value !== getValue()
    )
      element.current.value = getValue();
  });
  return {
    foundation,
    form,
    value: getValue(),
    ...state.current,
    error: form.mergedError || foundation.getLengthError(),
  };
}
