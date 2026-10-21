import type { Ref } from 'vue';
import { computed, onMounted, onUpdated, ref, watch } from 'vue';

import { createItemIndex } from '@sdata/web-core/_utils/item-index';

export const useIndex = ({
  itemRef,
  selector,
  index,
  parentClassName,
}: {
  itemRef: Ref<HTMLElement | undefined>;
  selector: string;
  index?: Ref<number | undefined>;
  parentClassName?: string;
}) => {
  const _index = ref(-1);
  const computedIndex = computed(() => index?.value ?? _index.value);

  const parent = ref<HTMLElement>();

  const foundation = createItemIndex({
    get item() {
      return itemRef.value;
    },
    selector,
    get explicit() {
      return index?.value;
    },
    parentClassName,
    get value() {
      return _index.value;
    },
    get parent() {
      return parent.value;
    },
    set parent(value) {
      parent.value = value;
    },
    setValue(value) {
      _index.value = value;
    },
  });
  watch(itemRef, foundation.syncItem);
  watch(
    parent,
    (element, _, onCleanup) => {
      const cleanup = foundation.observe(element);
      if (cleanup) onCleanup(cleanup);
    },
    { flush: 'post' },
  );
  onMounted(foundation.mount);
  onUpdated(foundation.updated);

  return {
    computedIndex,
  };
};
