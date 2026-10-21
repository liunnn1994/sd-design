import { toRefs, watchEffect } from 'vue';

import { createPopupOverflowHidden } from '@sdata/web-core/popup/overflow';

interface PopupOverflowHiddenProps {
  container: HTMLElement | undefined;
  hidden: boolean;
}

export default function usePopupOverflowHidden(props: PopupOverflowHiddenProps) {
  const { container, hidden } = toRefs(props);

  const getScrollBarWidth = (element: HTMLElement) => {
    return element.tagName === 'BODY'
      ? window.innerWidth - (document.body.clientWidth || document.documentElement.clientWidth)
      : element.offsetWidth - element.clientWidth;
  };

  const controller = createPopupOverflowHidden({
    get element() {
      return container.value;
    },
    getScrollBarWidth,
  });
  const setContainerStyle = controller.lock;
  const resetContainerStyle = controller.reset;

  watchEffect((onInvalidate) => {
    hidden.value ? setContainerStyle() : resetContainerStyle();

    onInvalidate(() => {
      resetContainerStyle();
    });
  });

  return [resetContainerStyle, setContainerStyle];
}
