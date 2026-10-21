import { acquireOverflowLock, releaseOverflowLock } from './overflow-lock.js';

export function createOverflowController(adapter: {
  readonly element: HTMLElement | undefined;
  getScrollBarWidth(element: HTMLElement): number;
  isScroll(element: HTMLElement): boolean;
}) {
  let lockedElement: HTMLElement | undefined;
  function lock() {
    const element = adapter.element;
    if (!element || lockedElement) return;
    const scrollBarWidth = adapter.getScrollBarWidth(element);
    const styles =
      scrollBarWidth > 0 || adapter.isScroll(element)
        ? {
            overflow: 'hidden',
            width: `${element.offsetWidth - scrollBarWidth}px`,
            boxSizing: 'border-box',
          }
        : undefined;
    if (acquireOverflowLock(element, styles)) lockedElement = element;
  }
  function reset() {
    if (!lockedElement) return;
    const element = lockedElement;
    lockedElement = undefined;
    releaseOverflowLock(element);
  }
  function syncElement() {
    if (lockedElement) {
      reset();
      lock();
    }
  }
  return { lock, reset, syncElement };
}

export function createPopupOverflowHidden(adapter: {
  readonly element: HTMLElement | undefined;
  getScrollBarWidth(element: HTMLElement): number;
}) {
  let lockedElement: HTMLElement | undefined;
  function lock() {
    const element = adapter.element;
    if (!element || lockedElement) return;
    const width = adapter.getScrollBarWidth(element);
    const styles = {
      overflow: 'hidden',
      ...(width ? { width: `calc(${element.style.width || '100%'} - ${width}px)` } : {}),
    };
    if (acquireOverflowLock(element, styles)) lockedElement = element;
  }
  function reset() {
    if (!lockedElement) return;
    releaseOverflowLock(lockedElement);
    lockedElement = undefined;
  }
  return { lock, reset };
}
