import { Ref } from 'vue';

import { isFunction } from '../_utils/is';
import { createResizeObserverController } from '../_utils/resize-observer';

export const useResizeObserver = ({
  elementRef,
  onResize,
}: {
  elementRef: Ref<HTMLElement | undefined>;
  onResize: (entry: ResizeObserverEntry) => void;
}) => {
  const observer = createResizeObserverController((entry) => {
    isFunction(onResize) && onResize(entry);
  });
  const createResizeObserver = () => observer.observe(elementRef.value);
  const destroyResizeObserver = observer.disconnect;

  return {
    createResizeObserver,
    destroyResizeObserver,
  };
};
