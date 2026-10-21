import type { NumberFlowValue, NumberFlowTrend } from './types.js';

export function getNumberFlowTrend(
  trend: NumberFlowTrend | undefined,
  previous: number,
  current: number,
) {
  return typeof trend === 'function'
    ? trend(previous, current)
    : (trend ?? Math.sign(current - previous));
}

export function sanitizeDuration(duration: number) {
  return Number.isFinite(duration) && duration >= 0 ? duration : 0;
}

/** 解析 duration，支持 '2s' / '500ms' 等字符串形式；非法值回退到 fallback */
export function parseDuration(
  duration: number | string | CSSNumericValue | undefined,
  fallback: number,
): number {
  if (typeof duration === 'number') {
    return Number.isFinite(duration) ? duration : fallback;
  }
  if (typeof duration === 'string') {
    const match = /^(\d+(?:\.\d+)?)(ms|s)?$/i.exec(duration.trim());
    if (match) {
      const amount = Number.parseFloat(match[1]);
      return (match[2] ?? '').toLowerCase() === 's' ? amount * 1000 : amount;
    }
  }
  return fallback;
}

/** NaN 等非法数值统一回退为 0，避免渲染出 'NaN' */
export function sanitizeValue(val: NumberFlowValue): number {
  const numeric = typeof val === 'string' ? Number.parseFloat(val) : val;
  return Number.isNaN(numeric) ? 0 : numeric;
}

export function sanitizeEasing(easing: string) {
  return /^[a-zA-Z0-9(),.\s+-]+$/.test(easing) ? easing : 'linear';
}
