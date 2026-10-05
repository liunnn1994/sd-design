import { toRefs, watchEffect } from 'vue';

import { acquireOverflowLock, releaseOverflowLock } from '../_utils/overflow-lock';

interface PopupOverflowHiddenProps {
  container: HTMLElement | undefined;
  hidden: boolean;
}

export default function usePopupOverflowHidden(props: PopupOverflowHiddenProps) {
  const { container, hidden } = toRefs(props);

  let lockedElement: HTMLElement | undefined;

  const getScrollBarWidth = (element: HTMLElement) => {
    return element.tagName === 'BODY'
      ? window.innerWidth - (document.body.clientWidth || document.documentElement.clientWidth)
      : element.offsetWidth - element.clientWidth;
  };

  const setContainerStyle = () => {
    const element = container.value;
    if (!element || lockedElement) return;
    const scrollBarWidth = getScrollBarWidth(element);
    const styles = {
      overflow: 'hidden',
      ...(scrollBarWidth
        ? { width: `calc(${element.style.width || '100%'} - ${scrollBarWidth}px)` }
        : {}),
    };
    if (acquireOverflowLock(element, styles)) lockedElement = element;
  };

  const resetContainerStyle = () => {
    if (!lockedElement) return;
    releaseOverflowLock(lockedElement);
    lockedElement = undefined;
  };

  watchEffect((onInvalidate) => {
    hidden.value ? setContainerStyle() : resetContainerStyle();

    onInvalidate(() => {
      resetContainerStyle();
    });
  });

  return [resetContainerStyle, setContainerStyle];
}
