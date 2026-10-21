import type { PopupType } from '@sdata/web-core/popup/manager';

import { onMounted, onBeforeUnmount, readonly, Ref, ref, watch } from 'vue';

import { createPopupEntry } from '@sdata/web-core/popup/manager';
export type { PopupType } from '@sdata/web-core/popup/manager';

export default function usePopupManager(
  type: PopupType,
  {
    visible,
    runOnMounted,
  }: {
    visible?: Ref<boolean>;
    runOnMounted?: boolean;
  } = {},
) {
  const zIndex = ref(0);
  const { open, close, isLastDialog } = createPopupEntry(type, {
    get zIndex() {
      return zIndex.value;
    },
    setZIndex(value) {
      zIndex.value = value;
    },
  });

  watch(
    () => visible?.value,
    (visible) => {
      if (visible) {
        open();
      } else {
        close();
      }
    },
    {
      immediate: true,
    },
  );

  if (runOnMounted) {
    onMounted(() => {
      open();
    });
  }

  onBeforeUnmount(close);

  return {
    zIndex: readonly(zIndex),
    open,
    close,
    isLastDialog,
  };
}
