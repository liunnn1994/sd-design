import NP from 'number-precision';

import type { Size, Status } from '../_utils/constant.js';

import { isObject } from '../_utils/is.js';

export const PROGRESS_TYPES = ['line', 'circle'] as const;
export type ProgressType = (typeof PROGRESS_TYPES)[number];
type ProgressColor = string | Record<string, unknown>;
export const getProgressPercent = (percent: number) => NP.times(percent, 100);
export const getProgressText = (percent: number) => `${getProgressPercent(percent)}%`;

export interface ProgressOptions {
  type: ProgressType;
  steps: number;
  percent: number;
  status?: Status;
  width?: number | string;
  strokeWidth?: number;
}
export function createProgressFoundation(options: ProgressOptions) {
  const getType = () => (options.steps > 0 ? 'steps' : options.type);
  const getStatus = () => options.status || (options.percent >= 1 ? 'success' : 'normal');
  const getCircleWidth = () => (typeof options.width === 'number' ? options.width : undefined);
  const getCircleStrokeWidth = () =>
    getType() === 'line' ? options.strokeWidth || 4 : options.strokeWidth;
  return { getType, getStatus, getCircleWidth, getCircleStrokeWidth };
}

export function getProgressBackground(color?: ProgressColor) {
  if (!color) return undefined;
  if (isObject(color)) {
    const val = Object.keys(color)
      .map((key) => `${color[key]} ${key}`)
      .join(',');
    return { backgroundImage: `linear-gradient(to right, ${val})` };
  }
  return { backgroundColor: color };
}

const LINE_STROKE_WIDTH = { small: 3, medium: 4, large: 8 };
export interface ProgressLineOptions {
  size: keyof typeof LINE_STROKE_WIDTH;
  strokeWidth?: number;
  percent: number;
  width: number | string;
  color?: ProgressColor;
  trackColor?: string;
}
export function createProgressLineFoundation(options: ProgressLineOptions) {
  const getStrokeWidth = () => options.strokeWidth ?? LINE_STROKE_WIDTH[options.size];
  const getStyle = () => ({
    width: typeof options.width === 'number' ? `${options.width}px` : options.width,
    height: `${getStrokeWidth()}px`,
    backgroundColor: options.trackColor,
  });
  const getBarStyle = () => ({
    width: `${options.percent * 100}%`,
    ...getProgressBackground(options.color),
  });
  return { getStyle, getBarStyle };
}

const CIRCLE_WIDTH = { mini: 16, small: 48, medium: 64, large: 80 };
const CIRCLE_STROKE_WIDTH = { mini: 4, small: 3, medium: 4, large: 4 };
export interface ProgressCircleOptions {
  size: Size;
  width?: number;
  strokeWidth?: number;
  pathStrokeWidth?: number;
  color?: ProgressColor;
  percent: number;
  trackColor?: string;
}
export function createProgressCircleFoundation(
  options: ProgressCircleOptions,
  getGradientId: () => string,
) {
  const isLinearGradient = () => isObject(options.color);
  const getGradientStops = (): [string, string][] =>
    isObject(options.color)
      ? Object.entries(options.color).map(([offset, color]) => [offset, String(color)])
      : [];
  const getSolidColor = () => (typeof options.color === 'string' ? options.color : undefined);
  const getWidth = () => options.width ?? CIRCLE_WIDTH[options.size];
  const getStrokeWidth = () =>
    options.strokeWidth ??
    (options.size === 'mini' ? getWidth() / 2 : CIRCLE_STROKE_WIDTH[options.size]);
  const getPathStrokeWidth = () =>
    options.pathStrokeWidth ??
    (options.size === 'mini' ? getStrokeWidth() : Math.max(2, getStrokeWidth() - 2));
  const getRadius = () => (getWidth() - getStrokeWidth()) / 2;
  const getPerimeter = () => Math.PI * 2 * getRadius();
  const getCenter = () => getWidth() / 2;
  const getIconStyle = () => ({ fontSize: getWidth() - 2, color: getSolidColor() });
  const getTrackStyle = () => ({ stroke: options.trackColor });
  const getCircleStyle = () => ({
    stroke: isLinearGradient() ? `url(#${getGradientId()})` : getSolidColor(),
    strokeDasharray: getPerimeter(),
    strokeDashoffset: (options.percent >= 1 ? 0 : 1 - options.percent) * getPerimeter(),
  });
  return {
    isLinearGradient,
    getGradientStops,
    getWidth,
    getStrokeWidth,
    getPathStrokeWidth,
    getRadius,
    getCenter,
    getIconStyle,
    getTrackStyle,
    getCircleStyle,
  };
}

export interface ProgressStepsOptions {
  steps: number;
  percent: number;
  size?: string;
  strokeWidth?: number;
  color?: ProgressColor;
  trackColor?: string;
}
export function createProgressStepsFoundation(options: ProgressStepsOptions) {
  const getActiveColor = () => (typeof options.color === 'string' ? options.color : undefined);
  const getStrokeWidth = () => options.strokeWidth ?? (options.size === 'small' ? 8 : 4);
  const getSteps = () =>
    [...Array(options.steps)].map(
      (_, index) => options.percent > 0 && options.percent > (1 / options.steps) * index,
    );
  const getStepStyle = (active: boolean) => ({
    backgroundColor: active ? getActiveColor() : options.trackColor,
  });
  return { getStrokeWidth, getSteps, getStepStyle };
}
