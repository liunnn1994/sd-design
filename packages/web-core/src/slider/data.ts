import NP from 'number-precision';

import type { Direction } from '../_utils/constant.js';
import type { SliderOptions, SliderRect, SliderValue } from './types.js';

import { isArray, isUndefined } from '../_utils/is.js';

export function getSliderInitialValues(
  model: SliderValue | undefined,
  fallback: SliderValue,
): [number, number] {
  const value = isUndefined(model) ? fallback : model;
  return isArray(value) ? [value[0], value[1]] : [0, value];
}
export const getOffsetPercent = (value: number, [min, max]: [number, number]): string => {
  const percent = Math.min(Math.max((value - min) / (max - min), 0), 1);
  return `${Math.round(percent * 10_000) / 100}%`;
};
export const getPositionStyle = (offset: string, direction: Direction) =>
  direction === 'vertical' ? { bottom: offset } : { left: offset };
export function getSliderBarStyle(
  [start, end]: [number, number],
  options: Pick<SliderOptions, 'min' | 'max' | 'direction'>,
) {
  if (start > end) [start, end] = [end, start];
  return options.direction === 'vertical'
    ? {
        bottom: getOffsetPercent(start, [options.min, options.max]),
        top: getOffsetPercent(options.max + options.min - end, [options.min, options.max]),
      }
    : {
        left: getOffsetPercent(start, [options.min, options.max]),
        right: getOffsetPercent(options.max + options.min - end, [options.min, options.max]),
      };
}
export function getSliderValueByCoords(
  x: number,
  y: number,
  rect: SliderRect | undefined,
  options: Pick<SliderOptions, 'min' | 'max' | 'step' | 'direction'>,
) {
  if (!rect) return 0;
  const { left, top, width, height } = rect;
  const trackLength = options.direction === 'horizontal' ? width : height;
  const stepLength = (trackLength * options.step) / (options.max - options.min);
  let diff = options.direction === 'horizontal' ? x - left : top + height - y;
  if (diff < 0) diff = 0;
  if (diff > trackLength) diff = trackLength;
  const steps = Math.round(diff / stepLength);
  return Math.min(
    options.max,
    Math.max(options.min, NP.plus(options.min, NP.times(steps, options.step))),
  );
}
export function getSliderTicks(value: [number, number], min: number, max: number, step: number) {
  const steps: { key: number; isActive: boolean }[] = [];
  const stepsLength = Math.floor((max - min) / step);
  for (let i = 0; i <= stepsLength; i++) {
    const key = NP.plus(i * step, min);
    // oxlint-disable-next-line no-continue
    if (key <= min || key >= max) continue;
    steps.push({ key, isActive: key >= value[0] && key <= value[1] });
  }
  return steps;
}
export function getSliderMarks(marks: Record<number, string> | undefined, value: [number, number]) {
  return Object.keys(marks || {}).map((index) => {
    const key = Number(index);
    return { key, content: marks?.[key] ?? '', isActive: key >= value[0] && key <= value[1] };
  });
}
export const getSliderInputValue = (value: unknown) => (value == null ? undefined : Number(value));
