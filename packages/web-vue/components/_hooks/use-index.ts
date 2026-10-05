import type { Ref } from 'vue';
import { computed, onMounted, onUpdated, ref, watch } from 'vue';

import { isUndefined } from '../_utils/is';

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

  const getParent = () => {
    let parent = itemRef.value?.parentElement ?? undefined;
    if (parentClassName) {
      while (parent && !parent.classList.contains(parentClassName)) {
        parent = parent.parentElement ?? undefined;
      }
    }
    return parent;
  };

  const getIndex = () => {
    if (isUndefined(index?.value) && parent.value && itemRef.value) {
      const items = Array.from(parent.value.querySelectorAll(selector)).filter(
        (item) => !parentClassName || item.closest(`.${parentClassName}`) === parent.value,
      );
      const index = items.indexOf(itemRef.value);
      if (index !== _index.value) {
        _index.value = index;
      }
    }
  };

  watch(itemRef, () => {
    if (itemRef.value && !parent.value) {
      parent.value = getParent();
    }
  });

  watch(
    parent,
    (element, _, onCleanup) => {
      if (!element) return;
      const observer = new MutationObserver(getIndex);
      observer.observe(element, { childList: true, subtree: true });
      onCleanup(() => observer.disconnect());
    },
    { flush: 'post' },
  );

  onMounted(() => {
    if (itemRef.value) {
      parent.value = getParent();
    }
    getIndex();
  });
  onUpdated(() => {
    parent.value = getParent();
    getIndex();
  });

  return {
    computedIndex,
  };
};
