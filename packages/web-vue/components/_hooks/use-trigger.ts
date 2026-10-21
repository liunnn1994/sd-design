import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import {
  createCompatTriggerFoundation,
  getDefaultPopupVisible,
} from '@sdata/web-core/trigger/compat-state';

export const useTrigger = ({
  popupVisible,
  defaultPopupVisible,
  show,
  defaultShow,
  emit,
}: {
  popupVisible?: Ref<boolean | undefined>;
  defaultPopupVisible?: Ref<boolean | undefined>;
  show?: Ref<boolean | undefined>;
  defaultShow?: Ref<boolean | undefined>;
  emit: (
    event: 'update:popupVisible' | 'popupVisibleChange' | 'update:show' | 'showChange',
    visible: boolean,
  ) => void;
}) => {
  const state = {
    get defaultPopupVisible() {
      return defaultPopupVisible?.value;
    },
    get defaultShow() {
      return defaultShow?.value;
    },
    get popupVisible() {
      return popupVisible?.value;
    },
    get show() {
      return show?.value;
    },
    get localVisible() {
      return _popupVisible.value;
    },
    set localVisible(value) {
      _popupVisible.value = value;
    },
    get visible() {
      return computedPopupVisible.value;
    },
  };
  const _popupVisible = ref(getDefaultPopupVisible(state));
  const foundation = createCompatTriggerFoundation(state, emit);
  const computedPopupVisible = computed(foundation.getVisible);
  const { handlePopupVisibleChange } = foundation;
  watch(computedPopupVisible, foundation.syncLocal);
  return { computedPopupVisible, handlePopupVisibleChange };
};
