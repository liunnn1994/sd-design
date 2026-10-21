import type { MultilineOptions } from '@sdata/web-core/clamp/multiline';

// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  watch,
  watchPostEffect,
} from 'vue';
import type { ComponentPublicInstance, Ref } from 'vue';

import { createMultilineClamp } from '@sdata/web-core/clamp/multiline';

export type MultilineAffixRefSetter = (element: ComponentPublicInstance | Element | null) => void;
type MultilineShellOptions = Omit<
  MultilineOptions,
  'state' | 'afterRender' | 'active' | 'expanded'
> & {
  active: Ref<boolean>;
  expanded: Ref<boolean>;
  onClampedChange: (value: boolean) => void;
};

export function useMultilineClamp(options: MultilineShellOptions) {
  const state = {
    rootRef: shallowRef<HTMLElement | null>(null),
    contentRef: shallowRef<HTMLElement | null>(null),
    beforeRef: shallowRef<HTMLElement | null>(null),
    bodyRef: shallowRef<HTMLElement | null>(null),
    afterRef: shallowRef<HTMLElement | null>(null),
    isClamped: shallowRef(false),
  };
  const controller = createMultilineClamp({
    ...options,
    state,
    afterRender: (task) => {
      void nextTick(task);
    },
  });
  const setBeforeElement: MultilineAffixRefSetter = (element) =>
    controller.setBeforeElement(element instanceof HTMLElement ? element : null);
  const setAfterElement: MultilineAffixRefSetter = (element) =>
    controller.setAfterElement(element instanceof HTMLElement ? element : null);

  watch(options.expanded, () => controller.requestRecompute(), { flush: 'post' });
  watch(() => controller.isClamped.value, options.onClampedChange, {
    flush: 'post',
    immediate: true,
  });
  watchPostEffect((onCleanup) => {
    onCleanup(controller.observe());
  });
  watchPostEffect((onCleanup) => {
    onCleanup(controller.listenFonts());
  });
  onMounted(controller.mount);
  onUpdated(controller.updated);
  onBeforeUnmount(controller.dispose);

  return { ...controller, ...state, setBeforeElement, setAfterElement };
}
