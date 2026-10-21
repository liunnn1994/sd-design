import { isFunction } from '../_utils/is.js';
import { createScrollTween } from '../_utils/tween.js';

export function slide(el: HTMLElement, top: number, cb: () => void, smooth = true) {
  if (!smooth) {
    el.scrollTop = top;
    cb();
    return;
  }
  const tween = createScrollTween({
    from: { scrollTop: el.scrollTop },
    to: { scrollTop: top },
    easing: 'quartOut',
    duration: 300,
    onUpdate: (keys) => {
      el.scrollTop = keys.scrollTop;
    },
    onFinish: () => {
      if (isFunction(cb)) cb();
    },
  });
  tween.start();
  return () => tween.stop();
}

export const BOUNDARY_POSITIONS = ['start', 'end', 'center', 'nearest'] as const;
export type BoundaryPosition = (typeof BOUNDARY_POSITIONS)[number];
