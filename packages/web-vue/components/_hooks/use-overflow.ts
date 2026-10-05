import { Ref, watch } from 'vue';

import { getScrollBarWidth, isScroll } from '../_utils/dom';

interface OverflowLock {
  owners: number;
  overflow: string;
  width: string;
  boxSizing: string;
}

const overflowLocks = new WeakMap<HTMLElement, OverflowLock>();

export const useOverflow = (elementRef: Ref<HTMLElement | undefined>) => {
  let lockedElement: HTMLElement | undefined;

  const setOverflowHidden = () => {
    const element = elementRef.value;
    if (!element || lockedElement) return;
    const existingLock = overflowLocks.get(element);
    if (existingLock) {
      existingLock.owners++;
      lockedElement = element;
      return;
    }
    if (element.style.overflow === 'hidden') return;
    const scrollBarWidth = getScrollBarWidth(element);
    if (scrollBarWidth > 0 || isScroll(element)) {
      overflowLocks.set(element, {
        owners: 1,
        overflow: element.style.overflow,
        width: element.style.width,
        boxSizing: element.style.boxSizing,
      });
      element.style.overflow = 'hidden';
      element.style.width = `${element.offsetWidth - scrollBarWidth}px`;
      element.style.boxSizing = 'border-box';
      lockedElement = element;
    }
  };

  const resetOverflow = () => {
    if (!lockedElement) return;
    const element = lockedElement;
    lockedElement = undefined;
    const lock = overflowLocks.get(element)!;
    if (--lock.owners === 0) {
      element.style.overflow = lock.overflow;
      element.style.width = lock.width;
      element.style.boxSizing = lock.boxSizing;
      overflowLocks.delete(element);
    }
  };

  watch(elementRef, () => {
    if (lockedElement) {
      resetOverflow();
      setOverflowHidden();
    }
  });

  return {
    setOverflowHidden,
    resetOverflow,
  };
};
