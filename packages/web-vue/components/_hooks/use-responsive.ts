import { onUnmounted, Ref, isRef, computed, onMounted, watch } from 'vue';

import ResponsiveObserve, { type ScreenMap, SiderBreakpoint } from '../_utils/responsive-observe';

export function useResponsive(
  breakpoint: SiderBreakpoint | undefined | Ref<SiderBreakpoint | undefined>,
  callback: (checked: boolean) => void,
) {
  const resultBreakpoint = computed(() => (isRef(breakpoint) ? breakpoint.value : breakpoint));
  // Subscription Responsive
  let subscribeToken = '';
  let latestScreens: ScreenMap = {};
  onMounted(() => {
    subscribeToken = ResponsiveObserve.subscribe((screens, breakpointChecked) => {
      latestScreens = screens;
      if (!resultBreakpoint.value) return;
      if (!breakpointChecked || breakpointChecked === resultBreakpoint.value) {
        callback(!!screens[resultBreakpoint.value]);
      }
    });
  });
  watch(resultBreakpoint, (nextBreakpoint) => {
    if (subscribeToken && nextBreakpoint) {
      callback(!!latestScreens[nextBreakpoint]);
    }
  });
  // Unsubscribe
  onUnmounted(() => {
    if (subscribeToken) {
      ResponsiveObserve.unsubscribe(subscribeToken);
    }
  });
}
