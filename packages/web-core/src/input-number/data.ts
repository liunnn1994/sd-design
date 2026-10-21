import NP from 'number-precision';

import type { InputNumberOptions, InputNumberValue, InputNumberValueMode } from './types.js';

import { isNumber, isUndefined } from '../_utils/is.js';
import { addDecimal, compareDecimal, roundDecimal } from './decimal.js';

export const DECIMAL_PATTERN = /^[-+]?(\d+(\.\d*)?|\.\d+)$/;
// Preserve the legacy Vue component's setup-time precision policy without changing pure core imports.
export const configureInputNumberPrecision = () => NP.enableBoundaryChecking(false);
export const getInitialInputNumberMode = (options: InputNumberOptions): InputNumberValueMode =>
  options.stringMode || typeof (options.modelValue ?? options.defaultValue) === 'string'
    ? 'string'
    : 'number';

export interface InputNumberDataState {
  readonly precision: number | undefined;
  readonly mode: InputNumberValueMode;
  readonly raw: string;
}
export function createInputNumberData(options: InputNumberOptions, state: InputNumberDataState) {
  function getPrecision() {
    if (isNumber(options.precision)) {
      return Math.max(NP.digitLength(options.step), options.precision);
    }
    return undefined;
  }
  function getNumberValue(value: InputNumberValue) {
    if (isUndefined(value) || value === null || value === '') return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const normalizedValue = value.trim();
    if (!normalizedValue || /^[-.]$/.test(normalizedValue)) return undefined;
    const parsed = Number(options.parser?.(normalizedValue) ?? normalizedValue);
    // Non-finite parser results are not values.
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  function toPlainString(number: number | undefined) {
    if (!isNumber(number)) return '';
    const precision = state.precision;
    if (!precision) return String(number);
    const displayPrecision =
      number === options.min || number === options.max
        ? Math.max(precision, NP.digitLength(number))
        : precision;
    return number.toFixed(displayPrecision);
  }
  function getStringValue(number: number | undefined) {
    const value = toPlainString(number);
    return options.formatter?.(value) ?? value;
  }
  function getDisplayValue(value: InputNumberValue) {
    if (typeof value === 'string') {
      const normalizedValue = value.trim();
      if (!normalizedValue || /^[-.]$/.test(normalizedValue)) return value;
      // stringMode keeps canonical decimal strings verbatim so values beyond
      // Number's safe range never round-trip through Number.
      if (options.stringMode && DECIMAL_PATTERN.test(normalizedValue)) {
        return options.formatter?.(normalizedValue) ?? normalizedValue;
      }
      const parsed = getNumberValue(value);
      return isNumber(parsed) ? getStringValue(parsed) : '';
    }
    // 非有限数值（Infinity 等）不作为值显示
    if (typeof value === 'number' && !Number.isFinite(value)) return '';
    return getStringValue(value ?? undefined);
  }
  function getRawText(value: InputNumberValue, displayValue: string) {
    const text = options.stringMode && typeof value === 'string' ? value.trim() : displayValue;
    return DECIMAL_PATTERN.test(text) ? text : '';
  }
  function getLegalValue(value: number | undefined) {
    if (isUndefined(value)) return undefined;
    if (isNumber(state.precision)) value = NP.round(value, state.precision);
    if (isNumber(options.min) && value < options.min) value = options.min;
    if (isNumber(options.max) && value > options.max) value = options.max;
    return value;
  }
  function getLegalString(value: string) {
    if (isNumber(state.precision)) value = roundDecimal(value, state.precision);
    if (Number.isFinite(options.min) && compareDecimal(value, options.min) < 0) {
      value = addDecimal('0', options.min, false);
    }
    if (Number.isFinite(options.max) && compareDecimal(value, options.max) > 0) {
      value = addDecimal('0', options.max, false);
    }
    return value;
  }
  const getModelValue = (value: number | undefined): InputNumberValue =>
    state.mode === 'string' ? (isUndefined(value) ? '' : String(value)) : value;
  const compareToBoundary = (value: number | undefined, boundary: number) =>
    options.stringMode && DECIMAL_PATTERN.test(state.raw) && Number.isFinite(boundary)
      ? compareDecimal(state.raw, boundary)
      : (value ?? NaN) - boundary;
  return {
    getPrecision,
    getNumberValue,
    toPlainString,
    getStringValue,
    getDisplayValue,
    getRawText,
    getLegalValue,
    getLegalString,
    getModelValue,
    compareToBoundary,
  };
}
