import type { CarouselIndexes } from './types.js';

export function getCarouselItemState(
  index: number,
  context: {
    previousIndex?: number | undefined;
    animationName?: string;
    slideDirection?: string | undefined;
    mergedIndexes?: CarouselIndexes;
  },
) {
  const { previousIndex, animationName, slideDirection, mergedIndexes } = context;
  const current = mergedIndexes?.mergedIndex === index;
  return {
    current,
    prev: index === mergedIndexes?.mergedPrevIndex,
    next: index === mergedIndexes?.mergedNextIndex,
    slideIn: animationName === 'slide' && slideDirection && current,
    slideOut: animationName === 'slide' && slideDirection && index === previousIndex,
  };
}

export function getCarouselAnimationStyle(timing: string | undefined, speed: number | undefined) {
  return {
    transitionTimingFunction: timing,
    transitionDuration: `${speed}ms`,
    animationTimingFunction: timing,
    animationDuration: `${speed}ms`,
  };
}
