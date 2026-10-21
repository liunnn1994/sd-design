import type { ImageLoadStatus as ImageLoadStatusType } from '@sdata/web-core/image/types';

import { computed, ref } from 'vue';

import { getImageLoadFlags } from '@sdata/web-core/image/foundation';

export default function useImageLoadStatus(defaultValue?: ImageLoadStatusType) {
  const status = ref<ImageLoadStatusType>(defaultValue || 'beforeLoad');
  const flags = computed(() => getImageLoadFlags(status.value));
  const isBeforeLoad = computed(() => flags.value.isBeforeLoad);
  const isLoading = computed(() => flags.value.isLoading);
  const isError = computed(() => flags.value.isError);
  const isLoaded = computed(() => flags.value.isLoaded);

  return {
    status,
    isBeforeLoad,
    isLoading,
    isError,
    isLoaded,
    setLoadStatus: (newStatus: ImageLoadStatusType) => {
      status.value = newStatus;
    },
  };
}
