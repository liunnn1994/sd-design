import NP from 'number-precision';

import type { SliderOptions, SliderRect, SliderValue } from './types.js';

import { isArray, isUndefined } from '../_utils/is.js';
import { KEYBOARD_KEY } from '../_utils/keyboard.js';
import { getSliderValueByCoords } from './data.js';

export interface SliderAdapter {
  readonly options: SliderOptions;
  readonly start: number;
  readonly end: number;
  readonly display: [number, number];
  readonly rect: SliderRect | undefined;
  isDisabled(): boolean;
  setStart(value: number): void;
  setEnd(value: number): void;
  measure(): void;
  onUpdate(value: SliderValue): void;
  onChange(value: SliderValue): void;
  onFormChange(): void;
}
export function createSliderFoundation(adapter: SliderAdapter) {
  function syncModel(value: SliderValue | undefined) {
    if (isArray(value)) {
      adapter.setStart(value[0] ?? adapter.options.min ?? 0);
      adapter.setEnd(value[1] ?? adapter.options.min ?? 0);
    } else {
      adapter.setEnd(value ?? adapter.options.min ?? 0);
    }
  }
  function syncValue() {
    const [start, end] = adapter.display;
    adapter.setStart(start);
    adapter.setEnd(end);
  }
  function publish() {
    if (adapter.options.range) {
      adapter.onUpdate([adapter.start, adapter.end]);
      adapter.onChange([adapter.start, adapter.end]);
    } else {
      adapter.onUpdate(adapter.end);
      adapter.onChange(adapter.end);
    }
    adapter.onFormChange();
  }
  function startChange(value?: number) {
    syncValue();
    let next = value ?? adapter.options.min;
    if (adapter.options.range && next > adapter.end) {
      // showInput 输入 start > end：排序后整体更新，而不是发出倒序区间
      const oldEnd = adapter.end;
      adapter.setEnd(next);
      next = oldEnd;
    }
    adapter.setStart(next);
    publish();
  }
  function endChange(value?: number) {
    syncValue();
    let next = value ?? adapter.options.min;
    if (adapter.options.range && next < adapter.start) {
      next = adapter.start;
      adapter.setStart(value ?? adapter.options.min);
    }
    adapter.setEnd(next);
    publish();
  }
  function keydown(which: 'start' | 'end', e: { key: string; preventDefault(): void }) {
    if (adapter.isDisabled()) return;
    syncValue();
    const minV = adapter.options.min;
    const maxV = adapter.options.max;
    const current = which === 'start' ? adapter.start : adapter.end;
    let next: number | undefined;
    if (e.key === KEYBOARD_KEY.ARROW_RIGHT || e.key === KEYBOARD_KEY.ARROW_UP) {
      next = NP.plus(current, adapter.options.step);
    } else if (e.key === KEYBOARD_KEY.ARROW_LEFT || e.key === KEYBOARD_KEY.ARROW_DOWN) {
      next = NP.minus(current, adapter.options.step);
    } else if (e.key === KEYBOARD_KEY.HOME) {
      next = minV;
    } else if (e.key === KEYBOARD_KEY.END) {
      next = maxV;
    } else {
      return;
    }
    e.preventDefault();
    if (adapter.options.range) {
      if (which === 'start') {
        next = Math.max(minV, Math.min(next, NP.minus(adapter.end, adapter.options.step)));
      } else {
        next = Math.min(maxV, Math.max(NP.plus(adapter.start, adapter.options.step), next));
      }
    } else {
      next = Math.max(minV, Math.min(next, maxV));
    }
    if (which === 'start') {
      startChange(next);
    } else {
      endChange(next);
    }
  }
  function getValue(): [number, number] {
    if (adapter.options.range) {
      if (isArray(adapter.options.modelValue)) {
        return adapter.options.modelValue;
      }
      return [adapter.start, adapter.options.modelValue ?? adapter.end];
    }
    if (isUndefined(adapter.options.modelValue)) {
      return [adapter.options.min, adapter.end];
    }
    if (isArray(adapter.options.modelValue)) {
      // 非 range 模式收到数组 modelValue 时取第一项，而不是静默丢弃
      return [adapter.options.min ?? 0, adapter.options.modelValue[0] ?? adapter.end];
    }
    return [adapter.options.min ?? 0, adapter.options.modelValue];
  }
  const getValueByCoords = (x: number, y: number) =>
    getSliderValueByCoords(x, y, adapter.rect, adapter.options);
  function endMoving(x: number, y: number) {
    syncValue();
    adapter.setEnd(getValueByCoords(x, y));
    publish();
  }
  function startMoving(x: number, y: number) {
    syncValue();
    adapter.setStart(getValueByCoords(x, y));
    publish();
  }
  function click(e: { clientX: number; clientY: number }) {
    if (adapter.isDisabled()) {
      return;
    }

    syncValue();
    const { clientX, clientY } = e;

    adapter.measure();

    const value = getValueByCoords(clientX, clientY);

    if (adapter.options.range) {
      // range 模式：轨道点击移动距离点击位置最近的把手
      const startDist = Math.abs(adapter.start - value);
      const endDist = Math.abs(adapter.end - value);
      if (startDist < endDist) {
        adapter.setStart(value);
      } else {
        adapter.setEnd(value);
      }
    } else {
      adapter.setEnd(value);
    }

    publish();
  }
  return {
    getValue,
    syncModel,
    startChange,
    endChange,
    keydown,
    startMoving,
    endMoving,
    click,
    moveStart: () => adapter.measure(),
  };
}
