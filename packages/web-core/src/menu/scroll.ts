import scrollIntoView from 'scroll-into-view-if-needed';

export function scrollMenuItemIntoView(element: HTMLElement, config?: Record<string, unknown>) {
  scrollIntoView(element, {
    behavior: 'smooth',
    block: 'nearest',
    scrollMode: 'if-needed',
    boundary: document.documentElement,
    ...config,
  });
}
