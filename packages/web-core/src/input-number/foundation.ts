import NP from 'number-precision';

import type { createInputNumberData } from './data.js';
import type {
  InputNumberOptions,
  InputNumberValue,
  InputNumberValueMode,
  InputNumberPropFormatter,
  InputNumberParser,
  InputNumberStep,
} from './types.js';

import { isNumber } from '../_utils/is.js';
import { getKeyDownHandler, KEYBOARD_KEY } from '../_utils/keyboard.js';
import { DECIMAL_PATTERN } from './data.js';
import { addDecimal } from './decimal.js';

const FIRST_DELAY = 800;
const SPEED = 150;
export interface InputNumberAdapter {
  readonly options: InputNumberOptions;
  readonly data: ReturnType<typeof createInputNumberData>;
  readonly inner: string;
  readonly raw: string;
  readonly number: number | undefined;
  readonly minReached: boolean;
  readonly maxReached: boolean;
  setInner(value: string): void;
  setRaw(value: string): void;
  setMinReached(value: boolean): void;
  setMaxReached(value: boolean): void;
  setMode(value: InputNumberValueMode): void;
  isDisabled(): boolean;
  isMouseEvent(event: Event): boolean;
  focus(): void;
  setTimer(callback: () => void, delay: number): number;
  clearTimer(timer: number): void;
  dispatchRepeat(event: Event): void;
  onUpdate(value: InputNumberValue): void;
  onChange(value: InputNumberValue, event: Event): void;
  onInput(value: InputNumberValue, text: string, event: Event): void;
  onBlur(event: FocusEvent): void;
  onClear(event: Event): void;
  onKeydown(event: KeyboardEvent): void;
  onFormChange(event: Event): void;
}
export function createInputNumberFoundation(adapter: InputNumberAdapter) {
  let repeatTimer = 0;
  function clearRepeatTimer() {
    if (repeatTimer) {
      adapter.clearTimer(repeatTimer);
      repeatTimer = 0;
    }
  }
  function updateNumberStatus(number: number | undefined) {
    adapter.setMinReached(adapter.data.compareToBoundary(number, adapter.options.min) <= 0);
    adapter.setMaxReached(adapter.data.compareToBoundary(number, adapter.options.max) >= 0);
  }
  function handleExceedRange(): InputNumberValue {
    const finalValue = adapter.data.getLegalValue(adapter.number);
    const useString = adapter.options.stringMode && DECIMAL_PATTERN.test(adapter.raw);
    if (useString) {
      adapter.setRaw(adapter.data.getLegalString(adapter.raw));
      adapter.setInner(adapter.options.formatter?.(adapter.raw) ?? adapter.raw);
    } else {
      adapter.setInner(adapter.data.getStringValue(finalValue));
      adapter.setRaw(isNumber(finalValue) ? adapter.data.toPlainString(finalValue) : '');
    }
    updateNumberStatus(adapter.number);
    const emitted = useString ? adapter.raw : adapter.data.getModelValue(finalValue);
    committedValue = emitted;
    adapter.onUpdate(emitted);
    return emitted;
  }
  function nextStep(method: InputNumberStep, event: Event) {
    if (
      adapter.isDisabled() ||
      (method === 'plus' && adapter.maxReached) ||
      (method === 'minus' && adapter.minReached)
    )
      return;
    const steppedText =
      adapter.options.stringMode &&
      DECIMAL_PATTERN.test(adapter.raw) &&
      Number.isFinite(adapter.options.step)
        ? adapter.data.getLegalString(
            addDecimal(adapter.raw, adapter.options.step, method === 'minus'),
          )
        : undefined;
    const nextValue =
      steppedText !== undefined
        ? Number(steppedText)
        : isNumber(adapter.number)
          ? adapter.data.getLegalValue(NP[method](adapter.number, adapter.options.step))
          : adapter.data.getLegalValue(adapter.options.min === -Infinity ? 0 : adapter.options.min);
    adapter.setRaw(steppedText ?? adapter.data.toPlainString(nextValue));
    adapter.setInner(
      steppedText !== undefined
        ? (adapter.options.formatter?.(adapter.raw) ?? adapter.raw)
        : adapter.data.getStringValue(nextValue),
    );
    updateNumberStatus(nextValue);
    const emittedValue = steppedText ?? adapter.data.getModelValue(nextValue);
    committedValue = emittedValue;
    adapter.onUpdate(emittedValue);
    adapter.onChange(emittedValue, event);
  }
  function handleStepButton(event: Event, method: InputNumberStep, needRepeat = false) {
    event.preventDefault();
    if (adapter.options.readonly) return;
    // Mirror nextStep's guard before focusing so a disabled/boundary button
    // never steals focus from wherever the user currently is.
    if (
      adapter.isDisabled() ||
      (method === 'plus' && adapter.maxReached) ||
      (method === 'minus' && adapter.minReached)
    )
      return;
    adapter.focus();
    nextStep(method, event);
    if (needRepeat) {
      repeatTimer = adapter.setTimer(
        () => adapter.dispatchRepeat(event),
        repeatTimer ? SPEED : FIRST_DELAY,
      );
    }
  }
  function handleInput(value: string, event: Event) {
    const normalizedValue = value.trim().replace(/。/g, '.');
    const parsedValue = adapter.options.parser?.(normalizedValue) ?? normalizedValue;
    if (
      parsedValue === '' ||
      Number.isFinite(Number(parsedValue)) ||
      /^[-.]$/.test(String(parsedValue))
    ) {
      adapter.setRaw(String(parsedValue));
      adapter.setInner(adapter.options.formatter?.(parsedValue) ?? String(parsedValue));
      updateNumberStatus(adapter.number);
      const emittedValue = getEmittedValue();
      adapter.onInput(emittedValue, adapter.inner, event);
      if (adapter.options.modelEvent === 'input') {
        committedValue = emittedValue;
        adapter.onUpdate(emittedValue);
        adapter.onChange(emittedValue, event);
      }
    }
    // Non-numeric text is rejected outright; the underlying SdInput's
    // keepControl restores the DOM to innerValue on the next tick, so the
    // invalid text never lingers in the input.
  }
  function getEmittedValue(): InputNumberValue {
    // In stringMode the accepted raw digit string is emitted as-is so typed
    // high-precision decimals survive the Number round-trip.
    if (adapter.options.stringMode && DECIMAL_PATTERN.test(adapter.raw)) return adapter.raw;
    return adapter.data.getModelValue(adapter.number);
  }
  function handleChange(value: string, event: Event) {
    if (adapter.isMouseEvent(event) && !value) return;
    const previousValue = committedValue;
    const emitted = handleExceedRange();
    if (emitted !== previousValue) adapter.onChange(emitted, event);
  }
  function handleBlur(event: FocusEvent) {
    if (getEmittedValue() !== committedValue) handleChange(adapter.inner, event);
    adapter.onBlur(event);
  }
  function handleClear(event: Event) {
    adapter.setInner('');
    adapter.setRaw('');
    updateNumberStatus(undefined);
    const emittedValue = adapter.data.getModelValue(undefined);
    committedValue = emittedValue;
    adapter.onUpdate(emittedValue);
    adapter.onChange(emittedValue, event);
    adapter.onFormChange(event);
    adapter.onClear(event);
  }
  function onKeyDown(event: KeyboardEvent) {
    adapter.onKeydown(event);
    if (!event.defaultPrevented) keyDownHandler(event);
  }
  let committedValue = getEmittedValue();
  const keyDownHandler = getKeyDownHandler(
    new Map([
      [
        KEYBOARD_KEY.ARROW_UP,
        (event: Event) => {
          event.preventDefault();
          if (!adapter.options.readonly) nextStep('plus', event);
        },
      ],
      [
        KEYBOARD_KEY.ARROW_DOWN,
        (event: Event) => {
          event.preventDefault();
          if (!adapter.options.readonly) nextStep('minus', event);
        },
      ],
    ]),
  );

  function syncModel(value: InputNumberValue) {
    if (adapter.options.stringMode) {
      adapter.setMode('string');
    } else if (typeof value === 'string') {
      adapter.setMode('string');
    } else if (typeof value === 'number') {
      adapter.setMode('number');
    }
    const nextNumberValue = adapter.data.getNumberValue(value);
    if (
      value !== adapter.inner &&
      (adapter.options.stringMode || nextNumberValue !== adapter.number)
    ) {
      adapter.setInner(adapter.data.getDisplayValue(value));
      adapter.setRaw(adapter.data.getRawText(value, adapter.inner));
      updateNumberStatus(nextNumberValue);
    } else if (value === '' && adapter.inner !== '') {
      adapter.setInner('');
      adapter.setRaw('');
      updateNumberStatus(undefined);
    }
    committedValue = getEmittedValue();
  }
  function syncFormatting(
    formatter: InputNumberPropFormatter | undefined,
    previousParser: InputNumberParser | undefined,
  ) {
    const rawValue = DECIMAL_PATTERN.test(adapter.raw)
      ? adapter.raw
      : (previousParser?.(adapter.inner) ?? adapter.inner);
    adapter.setRaw(String(rawValue));
    adapter.setInner(formatter?.(rawValue) ?? adapter.raw);
    updateNumberStatus(adapter.number);
  }
  function syncBounds() {
    handleExceedRange();
    updateNumberStatus(adapter.number);
  }
  return {
    clearRepeatTimer,
    handleStepButton,
    handleInput,
    getEmittedValue,
    handleChange,
    handleBlur,
    handleClear,
    onKeyDown,
    syncModel,
    syncFormatting,
    syncBounds,
  };
}
