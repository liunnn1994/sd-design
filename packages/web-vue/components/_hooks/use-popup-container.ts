import { toRefs, computed, ComputedRef } from 'vue';

import { resolvePopupContainer } from '@sdata/web-core/trigger/popup-container';

interface PopupContainerProps {
  popupContainer: string | HTMLElement | undefined;
}
export default function usePopupContainer<T extends HTMLElement | undefined>(
  defaultPopupContainer: T,
  props: PopupContainerProps,
) {
  const { popupContainer } = toRefs(props);

  const container = computed(() =>
    resolvePopupContainer({
      get popupContainer() {
        return popupContainer.value;
      },
      get defaultContainer() {
        return defaultPopupContainer;
      },
    }),
  );

  return container as ComputedRef<HTMLElement | T>;
}
