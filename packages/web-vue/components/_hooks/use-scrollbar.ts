import { computed, Ref } from 'vue';

import { isBoolean } from '../_utils/is';
import { ScrollbarProps } from '../scrollbar';

export const useScrollbar = (scrollbar: Ref<ScrollbarProps | boolean>) => {
  const displayScrollbar = computed(() => Boolean(scrollbar.value));

  const scrollbarProps = computed(() => {
    if (!scrollbar.value) return undefined;
    return {
      type: 'embed',
      ...(isBoolean(scrollbar.value) ? undefined : scrollbar.value),
    } as ScrollbarProps;
  });

  return {
    displayScrollbar,
    scrollbarProps,
  };
};
