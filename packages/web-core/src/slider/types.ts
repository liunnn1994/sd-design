import type { Direction } from '../_utils/constant.js';

export type SliderValue = number | [number, number];
export type SliderFormatTooltip = (value: number) => string;
export type SliderChangeHandler = (value: SliderValue) => void;
export interface SliderOptions {
  modelValue?: SliderValue;
  range: boolean;
  min: number;
  max: number;
  step: number;
  direction: Direction;
}
export interface SliderRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
