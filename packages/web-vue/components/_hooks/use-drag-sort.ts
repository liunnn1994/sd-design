import { onBeforeUnmount, watch, type Ref } from 'vue';

import { createDragSort } from '@sdata/web-core/drag-sort/index';

/** Vue owns the root lifecycle; the shared driver owns the drag gesture. */
export default function useDragSort(
  root: Ref<HTMLElement | null | undefined>,
  options: Parameters<typeof createDragSort>[1],
) {
  let driver: ReturnType<typeof createDragSort> | undefined;
  watch(
    root,
    (element) => {
      driver?.destroy();
      driver = element ? createDragSort(element, options) : undefined;
    },
    { flush: 'post', immediate: true },
  );
  onBeforeUnmount(() => driver?.destroy());
}
