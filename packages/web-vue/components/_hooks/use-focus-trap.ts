import type { UseFocusTrapOptions, UseFocusTrapReturn } from '@sdata/web-core/popup/focus-trap';

import { onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';

import { createFocusTrap } from '@sdata/web-core/popup/focus-trap';
export { getFocusableElements } from '@sdata/web-core/popup/focus-trap';
export type { UseFocusTrapOptions, UseFocusTrapReturn } from '@sdata/web-core/popup/focus-trap';

export const useFocusTrap = (
  containerRef: Ref<HTMLElement | undefined>,
  options?: UseFocusTrapOptions,
): UseFocusTrapReturn => {
  const trap = createFocusTrap(() => containerRef.value, options);
  onBeforeUnmount(trap.deactivate);
  return trap;
};
