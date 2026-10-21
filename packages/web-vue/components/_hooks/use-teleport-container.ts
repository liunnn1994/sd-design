import { onMounted, Ref, ref, watch } from 'vue';

import { createTeleportContainerFoundation } from '@sdata/web-core/trigger/teleport-container';

export const useTeleportContainer = ({
  popupContainer,
  visible,
  defaultContainer = 'body',
  documentContainer,
}: {
  popupContainer: Ref<string | HTMLElement | null | undefined>;
  visible: Ref<boolean>;
  defaultContainer?: string;
  documentContainer?: boolean;
}) => {
  const teleportContainer = ref(popupContainer.value);
  const containerRef = ref<HTMLElement>();

  const foundation = createTeleportContainerFoundation(
    {
      get popupContainer() {
        return popupContainer.value;
      },
      get teleportContainer() {
        return teleportContainer.value;
      },
      set teleportContainer(value) {
        teleportContainer.value = value;
      },
      get containerElement() {
        return containerRef.value;
      },
      set containerElement(value) {
        containerRef.value = value;
      },
    },
    { defaultContainer, documentContainer },
  );
  onMounted(() => foundation.getContainer());
  watch([popupContainer, visible], ([nextPopupContainer, nextVisible]) => {
    foundation.sync(nextPopupContainer, nextVisible);
  });

  return {
    teleportContainer,
    containerRef,
  };
};
