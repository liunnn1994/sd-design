import type { ResolvedTransition } from './transition.js';

import { timing } from './transition.js';

export type MotionValueEvent = 'change' | 'animationComplete';
export type MotionValueListener = (value: number) => void;

export type MotionDriver = (
  from: number,
  to: number,
  transition: ResolvedTransition,
  update: (value: number) => void,
  complete: () => void,
) => () => void;

export class MotionValue {
  private current: number;
  private changeListeners = new Set<MotionValueListener>();
  private completeListeners = new Set<() => void>();
  private stopAnimation: (() => void) | undefined;

  constructor(
    initial: number,
    private driver: MotionDriver,
  ) {
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
    const { duration } = transition;
    const complete = () => {
      this.set(target);
      this.completeListeners.forEach((listener) => listener());
    };
    if (target === this.current || duration <= 0) {
      complete();
      return;
    }
    this.stopAnimation = this.driver(
      this.current,
      target,
      transition,
      (value) => this.set(value),
      complete,
    );
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
