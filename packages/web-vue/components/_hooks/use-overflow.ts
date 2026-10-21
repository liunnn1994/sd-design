import { onBeforeUnmount, Ref, watch } from 'vue';

import { createOverflowController } from '@sdata/web-core/popup/overflow';

import { getScrollBarWidth, isScroll } from '../_utils/dom';

export const useOverflow = (elementRef: Ref<HTMLElement | undefined>) => {
  const controller = createOverflowController({
    get element() {
      return elementRef.value;
    },
    getScrollBarWidth,
    isScroll,
  });
  watch(elementRef, controller.syncElement);
  onBeforeUnmount(controller.reset);
  return { setOverflowHidden: controller.lock, resetOverflow: controller.reset };
};
