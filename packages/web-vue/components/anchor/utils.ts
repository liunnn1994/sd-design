import BTween from 'b-tween';

import { isFunction } from '../_utils/is';

export function slide(el: HTMLElement, top: number, cb: () => void, smooth = true) {
  if (!smooth) {
    // smooth=false: no animation, jump instantly
    el.scrollTop = top;
    cb();
    return;
  }
  const tween = new BTween({
    from: {
      scrollTop: el.scrollTop,
    },
    to: {
      scrollTop: top,
    },
    easing: 'quartOut',
    duration: 300,
    onUpdate: (keys: Record<string, number>) => {
      el.scrollTop = keys.scrollTop;
    },
    onFinish: () => {
      if (isFunction(cb)) {
        cb();
      }
    },
  });
  tween.start();
  return () => tween.stop();
}

export const BOUNDARY_POSITIONS = ['start', 'end', 'center', 'nearest'] as const;
export type BoundaryPosition = (typeof BOUNDARY_POSITIONS)[number];
