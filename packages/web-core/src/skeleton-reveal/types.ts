export interface SkeletonRevealProps {
  /** @zh 入场动画总时长（毫秒），0 表示直接显示 @en Entrance duration in milliseconds */
  duration?: number;
  /** @zh 进入视口时自动播放一次 @en Play once when entering the viewport */
  autoplay?: boolean;
  /** @zh 禁用入场动画，直接展示内容 @en Show content without animation */
  disabled?: boolean;
}

export interface SkeletonRevealExposed {
  /** @zh 重新测量并播放 @en Measure and replay */
  replay: () => Promise<void>;
  /** @zh 立即结束动画且保持内容可交互 @en Immediately reveal the interactive content */
  finish: () => void;
}

export type SkeletonRevealState = 'idle' | 'drawing' | 'complete';
export interface SkeletonRevealBox {
  width: number;
  height: number;
}
export interface SkeletonRevealShape extends SkeletonRevealBox {
  x: number;
  y: number;
  radius: number;
}
export interface SkeletonRevealAnimationOptions {
  duration: number;
  delay?: number;
  ease?: [number, number, number, number] | 'easeOut';
  onComplete?: () => void;
}

export interface SkeletonRevealAdapter {
  readonly props: Required<SkeletonRevealProps>;
  readonly reducedMotion: boolean;
  readonly root: HTMLElement | null;
  readonly content: HTMLElement | null;
  readonly overlay: SVGSVGElement | null;
  state: SkeletonRevealState;
  shapes: SkeletonRevealShape[];
  box: SkeletonRevealBox;
  afterRender(): Promise<void>;
  animate(
    element: Element,
    values: { opacity?: number[]; strokeDashoffset?: number[] },
    options: SkeletonRevealAnimationOptions,
  ): { cancel(): void };
  onFinish(): void;
}
