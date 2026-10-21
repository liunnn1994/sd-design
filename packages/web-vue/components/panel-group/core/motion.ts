import { MotionValue as CoreMotionValue } from '@sdata/web-core/panel-group/motion';
import { animate } from 'motion-v';
export type { MotionValueEvent, MotionValueListener } from '@sdata/web-core/panel-group/motion';

export class MotionValue extends CoreMotionValue {
  constructor(initial = 0) {
    super(initial, (from, target, transition, update, complete) => {
      const { duration, easing, ...options } = transition;
      const animation = animate(from, target, {
        ...options,
        duration: duration / 1000,
        ease: easing,
        onUpdate: update,
        onComplete: complete,
      });
      return () => animation.stop();
    });
  }
}
