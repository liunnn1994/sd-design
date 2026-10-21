import type { CarouselAutoPlayConfig, CarouselIndexes, CarouselSlideRequest } from './types.js';

import { isNumber, isObject } from '../_utils/is.js';
import { KEYBOARD_KEY } from '../_utils/keyboard.js';

const DEFAULT_AUTO_PLAY = { interval: 3000, hoverToPause: true };

export function getCarouselAutoPlay(
  value: boolean | CarouselAutoPlayConfig,
): CarouselAutoPlayConfig {
  if (isObject(value)) return { ...DEFAULT_AUTO_PLAY, ...value };
  return value ? DEFAULT_AUTO_PLAY : {};
}

export function getValidCarouselIndex(index: number, length: number): number {
  const value = +index;
  return length > 0 && Number.isFinite(value)
    ? ((Math.trunc(value) % length) + length) % length
    : 0;
}

export function getCarouselIndexes(
  current: number | undefined,
  inner: number,
  count: number,
): CarouselIndexes {
  const mergedIndex = isNumber(current) ? getValidCarouselIndex(current - 1, count) : inner;
  return {
    mergedIndex,
    mergedPrevIndex: getValidCarouselIndex(mergedIndex - 1, count),
    mergedNextIndex: getValidCarouselIndex(mergedIndex + 1, count),
  };
}

export function createCarousel(adapter: {
  readonly props: { current?: number; moveSpeed: number };
  readonly count: number;
  readonly indexes: CarouselIndexes;
  readonly autoPlay: CarouselAutoPlayConfig;
  innerIndex: number;
  previousIndex: number | undefined;
  slideDirection: 'positive' | 'negative' | undefined;
  paused: boolean;
  setInterval(callback: () => void, delay: number | undefined): number;
  clearInterval(timer: number): void;
  setTimeout(callback: () => void, delay: number): number;
  clearTimeout(timer: number): void;
  onUpdate(index: number): void;
  onChange(index: number, previous: number, manual: boolean): void;
}) {
  let intervalTimer = 0;
  let animationTimer = 0;

  function clearIntervalTimer() {
    if (intervalTimer) {
      adapter.clearInterval(intervalTimer);
      intervalTimer = 0;
    }
  }
  function clearAnimationTimer() {
    if (animationTimer) {
      adapter.clearTimeout(animationTimer);
      animationTimer = 0;
    }
  }
  function slideTo({ targetIndex, isNegative = false, isManual = false }: CarouselSlideRequest) {
    // Autoplay rescheduling must not clear the independent animation lock.
    if (adapter.count > 1 && !animationTimer && targetIndex !== adapter.innerIndex) {
      adapter.previousIndex = adapter.indexes.mergedIndex;
      adapter.innerIndex = targetIndex;
      adapter.slideDirection = isNegative ? 'negative' : 'positive';
      animationTimer = adapter.setTimeout(() => {
        animationTimer = 0;
      }, adapter.props.moveSpeed);
      adapter.onUpdate(adapter.innerIndex + 1);
      adapter.onChange(adapter.innerIndex + 1, adapter.previousIndex + 1, isManual);
    }
  }
  const prev = () =>
    slideTo({ targetIndex: adapter.indexes.mergedPrevIndex, isNegative: true, isManual: true });
  const next = () => slideTo({ targetIndex: adapter.indexes.mergedNextIndex, isManual: true });
  function select(index: number) {
    const count = adapter.count;
    if (!count) return;
    const forwardDistance = (index - adapter.indexes.mergedIndex + count) % count;
    slideTo({ targetIndex: index, isNegative: forwardDistance * 2 > count, isManual: true });
  }
  return {
    slideTo,
    prev,
    next,
    select,
    goTo(index: number) {
      const count = adapter.count;
      if (count) select(getValidCarouselIndex(index - 1, count));
    },
    syncIndex() {
      if (adapter.count > 0) {
        const current = adapter.props.current;
        adapter.innerIndex = getValidCarouselIndex(
          isNumber(current) ? current - 1 : adapter.innerIndex,
          adapter.count,
        );
      }
    },
    syncAutoPlay() {
      const { interval } = adapter.autoPlay || {};
      const { mergedNextIndex } = adapter.indexes;
      const paused = adapter.autoPlay.hoverToPause && adapter.paused;
      const shouldInterval = adapter.count > 1 && !paused && Boolean(interval);
      clearIntervalTimer();
      if (shouldInterval) {
        intervalTimer = adapter.setInterval(
          () => slideTo({ targetIndex: mergedNextIndex }),
          interval,
        );
      }
    },
    keydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === KEYBOARD_KEY.ARROW_RIGHT || event.key === KEYBOARD_KEY.ARROW_DOWN) {
        event.preventDefault();
        next();
      } else if (event.key === KEYBOARD_KEY.ARROW_LEFT || event.key === KEYBOARD_KEY.ARROW_UP) {
        event.preventDefault();
        prev();
      }
    },
    enter() {
      adapter.paused = true;
    },
    leave() {
      adapter.paused = false;
    },
    dispose() {
      clearIntervalTimer();
      clearAnimationTimer();
    },
  };
}
