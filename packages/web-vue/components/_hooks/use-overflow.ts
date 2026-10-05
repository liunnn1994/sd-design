import { Ref, watch } from 'vue';

import { getScrollBarWidth, isScroll } from '../_utils/dom';
import { acquireOverflowLock, releaseOverflowLock } from '../_utils/overflow-lock';

export const useOverflow = (elementRef: Ref<HTMLElement | undefined>) => {
  let lockedElement: HTMLElement | undefined;

  const setOverflowHidden = () => {
    const element = elementRef.value;
    if (!element || lockedElement) return;
    const scrollBarWidth = getScrollBarWidth(element);
    const styles =
      scrollBarWidth > 0 || isScroll(element)
        ? {
            overflow: 'hidden',
            width: `${element.offsetWidth - scrollBarWidth}px`,
            boxSizing: 'border-box',
          }
        : undefined;
    if (acquireOverflowLock(element, styles)) lockedElement = element;
  };

  const resetOverflow = () => {
    if (!lockedElement) return;
    const element = lockedElement;
    lockedElement = undefined;
    releaseOverflowLock(element);
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
