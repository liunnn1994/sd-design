import type { CarouselIndicatorType } from './types.js';

import { isActivationKey } from '../_utils/keyboard.js';

export function getCarouselSliderStyle(count: number, index: number) {
  const step = 100 / count;
  return { width: `${step}%`, left: `${index * step}%` };
}

export function createCarouselIndicator(adapter: {
  readonly props: { type: CarouselIndicatorType; count: number; activeIndex: number };
  onSelect(index: number): void;
}) {
  return {
    click(event: MouseEvent) {
      event.preventDefault();
      if (adapter.props.type === 'slider') {
        const x = event.offsetX;
        const width = (event.currentTarget as HTMLElement).clientWidth;
        if (event.target === event.currentTarget) {
          const index = Math.floor((x / width) * adapter.props.count);
          if (index !== adapter.props.activeIndex) adapter.onSelect(index);
        }
      } else {
        const index = Number.parseInt(
          (event.target as HTMLElement).getAttribute('data-index') ?? '',
          10,
        );
        if (!Number.isNaN(index) && index !== adapter.props.activeIndex) adapter.onSelect(index);
      }
    },
    keydown(event: KeyboardEvent, index: number) {
      if (isActivationKey(event) && index !== adapter.props.activeIndex) {
        event.preventDefault();
        adapter.onSelect(index);
      }
    },
  };
}
