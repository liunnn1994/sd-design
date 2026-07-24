import type { TriggerPosition } from '../_utils/constant';

export const getTransformOrigin = (position: TriggerPosition) => {
  let originX = '0';
  if (['top', 'bottom'].includes(position)) {
    originX = '50%';
  } else if (['left', 'lt', 'lb', 'tr', 'br'].includes(position)) {
    originX = '100%';
  }
  let originY = '0';
  if (['left', 'right'].includes(position)) {
    originY = '50%';
  } else if (['top', 'tl', 'tr', 'lb', 'rb'].includes(position)) {
    originY = '100%';
  }
  return `${originX} ${originY}`;
};

export const isScrollElement = (element: HTMLElement) => {
  return element.scrollHeight > element.offsetHeight || element.scrollWidth > element.offsetWidth;
};

export const getScrollElements = (container: HTMLElement | undefined) => {
  const scrollElements: HTMLElement[] = [];
  let element: HTMLElement | undefined = container;
  while (element && element !== document.documentElement) {
    if (isScrollElement(element)) {
      scrollElements.push(element);
    }
    element = element.parentElement ?? undefined;
  }
  return scrollElements;
};
