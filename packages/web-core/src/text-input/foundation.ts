import { countGraphemes, sliceGraphemes } from '../_utils/grapheme.js';
import { isFunction, isObject } from '../_utils/is.js';

export interface TextInputOptions {
  maxLength: number | { length: number; errorOnly?: boolean };
  wordLength?: (value: string) => number;
  wordSlice?: (value: string, maxLength: number) => string;
}

export interface TextInputAdapter {
  readonly options: TextInputOptions;
  readonly value: string;
  readonly valueLength: number;
  readonly maxLength: number;
  readonly errorOnly: boolean;
  readonly sliceLength: number;
  readonly composing: boolean;
  setInner(value: string): void;
  setComposing(value: boolean): void;
  setCompositionValue(value: string): void;
  setFocused(value: boolean): void;
  keepControl(): void;
  onUpdate(value: string): void;
  onInput(value: string, event: Event): void;
  onChange(value: string, event: Event): void;
  onClear(event: MouseEvent): void;
  onFocus(event: FocusEvent): void;
  onBlur(event: FocusEvent): void;
  onEnter(event: KeyboardEvent): void;
}

/** Input and Textarea retain their historical truncation and event-order contracts. */
export function createTextInputFoundation(adapter: TextInputAdapter, kind: 'input' | 'textarea') {
  let previousValue = adapter.value;
  const getLength = (value: string) =>
    isFunction(adapter.options.wordLength)
      ? adapter.options.wordLength(value)
      : countGraphemes(value);
  const getMaxLength = () =>
    isObject(adapter.options.maxLength)
      ? adapter.options.maxLength.length
      : adapter.options.maxLength;
  const getErrorOnly = () =>
    isObject(adapter.options.maxLength) && Boolean(adapter.options.maxLength.errorOnly);
  const getSliceLength = () =>
    kind === 'input' ? Math.floor(adapter.maxLength / getLength('a')) : adapter.maxLength;
  const getLengthError = () =>
    Boolean(
      (kind === 'input' || adapter.maxLength) &&
      adapter.errorOnly &&
      adapter.valueLength > adapter.maxLength,
    );

  function syncModel(value: string | null | undefined) {
    if (value === undefined || value === null) adapter.setInner('');
  }
  function updateValue(value: string, publish = true) {
    if (adapter.maxLength && !adapter.errorOnly && getLength(value) > adapter.maxLength) {
      if (isFunction(adapter.options.wordSlice))
        value = adapter.options.wordSlice(value, adapter.maxLength);
      else if (isFunction(adapter.options.wordLength)) value = value.slice(0, adapter.sliceLength);
      else value = sliceGraphemes(value, adapter.sliceLength);
    }
    adapter.setInner(value);
    if (publish) adapter.onUpdate(value);
    if (kind === 'textarea') adapter.keepControl();
    return value;
  }
  function change(value: string, event: Event) {
    if (value !== previousValue) {
      previousValue = value;
      adapter.onChange(value, event);
    }
  }
  function focus(event: FocusEvent) {
    if (kind === 'input') previousValue = adapter.value;
    adapter.setFocused(true);
    if (kind === 'textarea') previousValue = adapter.value;
    adapter.onFocus(event);
  }
  function blur(event: FocusEvent) {
    adapter.setFocused(false);
    if (kind === 'input') change(adapter.value, event);
    adapter.onBlur(event);
    if (kind === 'textarea') change(adapter.value, event);
  }
  function exceedsLimit(value: string) {
    return (
      adapter.maxLength &&
      !adapter.errorOnly &&
      adapter.valueLength >= adapter.maxLength &&
      getLength(value) > adapter.maxLength
    );
  }
  function input(value: string, inputType: string | undefined, event: Event) {
    if (adapter.composing) return;
    if (inputType === 'insertText' && exceedsLimit(value)) {
      adapter.keepControl();
      return;
    }
    const nextValue = updateValue(value);
    adapter.onInput(nextValue, event);
    if (kind === 'input') adapter.keepControl();
  }
  function composition(
    value: string,
    event: CompositionEvent,
    selectionStart?: number | null,
    selectionEnd?: number | null,
  ) {
    if (event.type !== 'compositionend') {
      adapter.setComposing(true);
      if (kind === 'input') adapter.setCompositionValue(adapter.value + (event.data ?? ''));
      return;
    }
    adapter.setComposing(false);
    if (kind === 'input') adapter.setCompositionValue('');
    if (exceedsLimit(value) && (kind === 'textarea' || selectionStart === selectionEnd)) {
      adapter.keepControl();
      return;
    }
    const nextValue = updateValue(value);
    adapter.onInput(nextValue, event);
    if (kind === 'input') adapter.keepControl();
  }
  function clear(event: MouseEvent) {
    updateValue('');
    change('', event);
    adapter.onClear(event);
  }
  function keydown(event: KeyboardEvent) {
    if (kind === 'input' && !adapter.composing && (event.key || event.code) === 'Enter') {
      change(adapter.value, event);
      adapter.onEnter(event);
    }
  }
  function getFitWidthText(compositionValue: string, password: boolean, placeholder?: string) {
    const value = compositionValue || adapter.value;
    return (password ? '•'.repeat(Array.from(value).length) : value) || placeholder;
  }
  return {
    getLength,
    getMaxLength,
    getErrorOnly,
    getSliceLength,
    getLengthError,
    getFitWidthText,
    syncModel,
    updateValue,
    focus,
    blur,
    input,
    composition,
    clear,
    keydown,
  };
}
