// 使用组件库现有 motion-v 动画能力，保留面板引擎的订阅接口和毫秒配置。
import { animate } from 'motion-v';

import type { ResolvedTransition } from './transition';

import { timing } from './transition';

export type MotionValueEvent = 'change' | 'animationComplete';
export type MotionValueListener = (value: number) => void;

export class MotionValue {
  private current: number;
  private changeListeners = new Set<MotionValueListener>();
  private completeListeners = new Set<() => void>();
  private stopAnimation: (() => void) | undefined;

  constructor(initial = 0) {
    this.current = initial;
  }

  get(): number {
    return this.current;
  }

  jump(value: number) {
    this.stop();
    this.set(value);
  }

  private set(value: number) {
    if (value === this.current) return;
    this.current = value;
    this.changeListeners.forEach((listener) => listener(value));
  }

  animate(target: number, transition: ResolvedTransition = timing()) {
    this.stop();
    const { duration, easing, ...options } = transition;
    const complete = () => {
      this.set(target);
      this.completeListeners.forEach((listener) => listener());
    };
    if (target === this.current || duration <= 0) {
      complete();
      return;
    }
    const animation = animate(this.current, target, {
      ...options,
      duration: duration / 1000,
      ease: easing,
      onUpdate: (value) => this.set(value),
      onComplete: complete,
    });
    this.stopAnimation = () => animation.stop();
  }

  stop() {
    this.stopAnimation?.();
    this.stopAnimation = undefined;
  }

  on(event: MotionValueEvent, listener: MotionValueListener | (() => void)) {
    const set = event === 'change' ? this.changeListeners : this.completeListeners;
    set.add(listener as () => void);
    return () => {
      set.delete(listener as () => void);
    };
  }
}
