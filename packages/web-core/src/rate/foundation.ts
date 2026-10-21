import NP from 'number-precision';

import { isNull, isObject, isString } from '../_utils/is.js';
import { KEYBOARD_KEY } from '../_utils/keyboard.js';

export interface RateOptions {
  count: number;
  grading: boolean;
  allowHalf: boolean;
  readonly: boolean | string;
  modelValue?: number;
  color?: string | Record<string, string>;
}
export interface RateAdapter {
  readonly options: RateOptions;
  readonly inner: number;
  readonly value: number;
  readonly display: number;
  readonly indices: undefined[];
  readonly colors: (string | undefined)[] | undefined;
  readonly hover: number;
  readonly animation: boolean;
  isDisabled(): boolean;
  isFormDisabled(): boolean;
  allowClear(): boolean | undefined;
  setInner(value: number): void;
  setHover(value: number): void;
  setAnimation(value: boolean): void;
  onUpdate(value: number): void;
  onChange(value: number): void;
  onHover(value: number): void;
  onFormChange(): void;
}
export function createRateFoundation(adapter: RateAdapter) {
  const getValue = () => adapter.options.modelValue ?? adapter.inner;
  const getIndices = (): undefined[] => [
    ...Array(adapter.options.grading ? 5 : adapter.options.count),
  ];
  function syncModel(value: number | null | undefined) {
    if (value === undefined || isNull(value)) adapter.setInner(0);
  }
  function getDisplay() {
    const fixedValue = adapter.options.allowHalf
      ? NP.times(NP.round(NP.divide(adapter.value, 0.5), 0), 0.5)
      : Math.round(adapter.value);
    return adapter.hover || fixedValue;
  }
  function getColors() {
    if (isString(adapter.options.color))
      return adapter.indices.map(() => adapter.options.color as string);
    if (isObject(adapter.options.color)) {
      const sortedKeys = Object.keys(adapter.options.color)
        .map((key) => Number(key))
        .sort((a, b) => b - a);
      let threshold = sortedKeys.pop() ?? adapter.indices.length;
      return adapter.indices.map((_, index) => {
        if (index + 1 > threshold) threshold = sortedKeys.pop() ?? threshold;
        return (adapter.options.color as Record<string, string>)[String(threshold)];
      });
    }
    return undefined;
  }
  function resetHover() {
    if (adapter.hover) {
      adapter.setHover(0);
      adapter.onHover(0);
    }
  }
  function mouseEnter(index: number, isHalf: boolean) {
    const nextHoverIndex = isHalf && adapter.options.allowHalf ? index + 0.5 : index + 1;
    if (nextHoverIndex !== adapter.hover) {
      adapter.setHover(nextHoverIndex);
      adapter.onHover(nextHoverIndex);
    }
  }
  function click(index: number, isHalf: boolean) {
    const nextValue = isHalf && adapter.options.allowHalf ? index + 0.5 : index + 1;
    adapter.setAnimation(true);
    if (nextValue !== adapter.value) {
      adapter.setInner(nextValue);
      adapter.onUpdate(nextValue);
      adapter.onChange(nextValue);
      adapter.onFormChange();
    } else if (adapter.allowClear()) {
      adapter.setInner(0);
      adapter.onUpdate(0);
      adapter.onChange(0);
      adapter.onFormChange();
    }
  }
  function animationEnd(index: number) {
    if (adapter.animation && index + 1 >= adapter.value - 1) adapter.setAnimation(false);
  }
  function keydown(event: { key: string; preventDefault(): void }) {
    if (adapter.isDisabled()) return;
    const step = adapter.options.allowHalf ? 0.5 : 1;
    let next = adapter.value;
    if (event.key === KEYBOARD_KEY.ARROW_RIGHT || event.key === KEYBOARD_KEY.ARROW_UP) {
      next += step;
    } else if (event.key === KEYBOARD_KEY.ARROW_LEFT || event.key === KEYBOARD_KEY.ARROW_DOWN) {
      next -= step;
    } else if (event.key === KEYBOARD_KEY.HOME) {
      next = 0;
    } else if (event.key === KEYBOARD_KEY.END) {
      next = adapter.indices.length;
    } else {
      return;
    }
    event.preventDefault();
    next = Math.max(0, Math.min(next, adapter.indices.length));
    if (next !== adapter.value) {
      adapter.setInner(next);
      adapter.onUpdate(next);
      adapter.onChange(next);
      adapter.onFormChange();
    }
  }
  function getAriaProps(index: number, isHalf = false) {
    const value = index + (isHalf ? 0.5 : 1);
    return {
      'role': 'radio',
      'aria-checked': value === adapter.value,
      'aria-setsize': adapter.options.allowHalf
        ? adapter.indices.length * 2
        : adapter.indices.length,
      'aria-posinset': adapter.options.allowHalf ? index * 2 + (isHalf ? 1 : 2) : index + 1,
    };
  }
  function getCharacterColor(index: number, isHalf: boolean) {
    // 按每个字符自身的 index 取 customColor（per-index 阈值色表），
    // 而非 parsedDisplayIndex（会让所有已填充字符都染上最后一档的颜色）。
    if (
      adapter.colors &&
      ((isHalf && adapter.options.allowHalf && index + 0.5 === adapter.display) ||
        (!isHalf && index + 1 <= adapter.display))
    ) {
      return { color: adapter.colors[index] };
    }
    return undefined;
  }
  function syncDisabled(disabled: boolean) {
    if (disabled) resetHover();
  }
  function getInteractionMode() {
    if (!adapter.isDisabled()) return 'edit';
    if (adapter.options.readonly && !adapter.isFormDisabled()) return 'readonly-tip';
    return 'none';
  }
  const getInteractionProps = (index: number, isHalf: boolean) =>
    adapter.options.allowHalf ? getAriaProps(index, isHalf) : {};
  const getGradingFace = (index: number) =>
    index > adapter.display
      ? 'inactive-meh'
      : adapter.display <= 2
        ? 'frown'
        : adapter.display <= 3
          ? 'meh'
          : 'smile';
  return {
    getValue,
    getIndices,
    syncModel,
    getDisplay,
    getColors,
    resetHover,
    mouseEnter,
    click,
    animationEnd,
    keydown,
    getAriaProps,
    getCharacterColor,
    syncDisabled,
    getInteractionMode,
    getInteractionProps,
    getGradingFace,
  };
}
