import BTween from 'b-tween';

export interface ScrollTween {
  start(): void;
  stop(): void;
}

export interface ScrollTweenOptions {
  from: { scrollTop: number };
  to: { scrollTop: number };
  duration?: number;
  easing?: string;
  onUpdate(values: Record<string, number>): void;
  onFinish?: (values: Record<string, number>) => void;
}

// Keep the untyped engine private so published declarations use this portable contract.
export function createScrollTween(options: ScrollTweenOptions): ScrollTween {
  return new BTween(options);
}
