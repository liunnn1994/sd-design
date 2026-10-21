import { onMounted, onUnmounted, computed, isRef, watch, type Ref } from 'vue';

import { createResponsiveSubscription } from '@sdata/web-core/_utils/responsive';

import type { SiderBreakpoint } from '../_utils/responsive-observe';
export function useResponsive(
  breakpoint: SiderBreakpoint | undefined | Ref<SiderBreakpoint | undefined>,
  callback: (checked: boolean) => void,
) {
  const resultBreakpoint = computed(() => (isRef(breakpoint) ? breakpoint.value : breakpoint));
  const subscription = createResponsiveSubscription(
    {
      get breakpoint() {
        return resultBreakpoint.value;
      },
    },
    callback,
  );
  onMounted(subscription.mount);
  watch(resultBreakpoint, subscription.refresh);
  onUnmounted(subscription.dispose);
}
