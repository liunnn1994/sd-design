// 缓动与时长配置。移植自 vendor/motion-panels 的 core/transition.ts，
// 时长单位为毫秒（vendor 原生为秒）。
import type { PanelTransition } from '../types';

import { reducedMotion } from './env';

/** cubic-bezier 缓动求值器（参数反解 + y 值采样）。 */
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const bezier1d = (t: number, c1: number, c2: number) =>
    3 * t * (1 - t) ** 2 * c1 + 3 * t ** 2 * (1 - t) * c2 + t ** 3;
  const invert = (t: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 12; i += 1) {
      const mid = (lo + hi) / 2;
      if (bezier1d(mid, x1, x2) < t) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    return (lo + hi) / 2;
  };

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // 由进度 t 反解曲线参数 s，再取 y(s)
    const s = invert(t);

    return bezier1d(s, y1, y2);
  };
};

/** 默认过渡：与 vendor 一致的缓动曲线，时长单位毫秒。 */
export const DEFAULT_TRANSITION: Required<Pick<PanelTransition, 'duration' | 'easing'>> = {
  duration: 250,
  easing: [0.32, 0.72, 0, 1],
};

/** 解析后的过渡配置。 */
export interface ResolvedTransition extends Omit<PanelTransition, 'duration' | 'easing'> {
  duration: number;
  easing: (t: number) => number;
}

/** 应用 reduced-motion；无自定义时长/缓动时使用默认曲线。 */
export const timing = (transition?: PanelTransition): ResolvedTransition => {
  if (reducedMotion.get()) {
    return { duration: 0, easing: (t) => t };
  }
  const config = transition ?? DEFAULT_TRANSITION;
  const easingTuple = config.easing ?? DEFAULT_TRANSITION.easing;
  const duration = config.duration ?? DEFAULT_TRANSITION.duration;

  return {
    ...config,
    duration,
    easing: bezier(...easingTuple),
  };
};

/** 转换为 CSS 缓动字符串（供 WAAPI / inline style 使用）。 */
export const cssEasing = (transition?: PanelTransition): string => {
  const tuple = transition?.easing ?? DEFAULT_TRANSITION.easing;
  const [x1, y1, x2, y2] = tuple;

  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
};
