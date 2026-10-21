import type { Dayjs } from 'dayjs';

import { isArray, isDayjs, isFunction, isNumber, isUndefined } from '../_utils/is.js';

export type PickerInputFormat = string | ((value: Dayjs) => string);

export function resolvePickerInputValue(state: {
  readonly inputValue?: string | undefined;
  readonly value?: Dayjs | undefined;
  readonly format: PickerInputFormat;
}) {
  if (state.inputValue !== undefined) return state.inputValue;
  const value = state.value;
  if (value && isDayjs(value)) {
    return isFunction(state.format) ? state.format(value) : value.format(state.format);
  }
  return undefined;
}

export interface PickerRangeInputState {
  readonly mergedDisabled: boolean;
  readonly disabled: boolean | boolean[];
  readonly focusedIndex: number | undefined;
  readonly inputValue: (string | undefined)[] | undefined;
  readonly value: (Dayjs | undefined)[];
  readonly format: PickerInputFormat;
  readonly inputs: readonly [HTMLInputElement | undefined, HTMLInputElement | undefined];
  emitFocusedIndexChange: (index: number) => void;
  emitUpdateFocusedIndex: (index: number) => void;
}

export function createPickerRangeInputFoundation(state: PickerRangeInputState) {
  const getDisabled = (index: number): boolean => {
    if (state.mergedDisabled) return state.mergedDisabled;
    return isArray(state.disabled) ? state.disabled[index] : state.disabled;
  };

  function getDisplayValue(index: number) {
    if (state.inputValue) return state.inputValue?.[index];
    return resolvePickerInputValue({
      get value() {
        return state.value?.[index];
      },
      get format() {
        return state.format;
      },
    });
  }

  function changeFocusedInput(index: number) {
    state.emitFocusedIndexChange(index);
    state.emitUpdateFocusedIndex(index);
  }

  function focus(index?: number) {
    const targetIndex = isNumber(index) ? index : state.focusedIndex;
    const targetElement = targetIndex === 0 ? state.inputs[0] : state.inputs[1];
    !isUndefined(targetIndex) &&
      !getDisabled(targetIndex) &&
      targetElement &&
      targetElement.focus &&
      targetElement.focus();
  }

  function blur() {
    const targetElement = state.focusedIndex === 0 ? state.inputs[0] : state.inputs[1];
    targetElement && targetElement.blur && targetElement.blur();
  }

  return { getDisabled, getDisplayValue, changeFocusedInput, focus, blur };
}
