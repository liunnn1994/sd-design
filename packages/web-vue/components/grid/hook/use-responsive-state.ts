import { ref, computed, watch, Ref, onUnmounted, onMounted } from 'vue';

import {
  isResponsiveValue,
  getScreenSnapshot,
  resolveResponsiveState,
} from '@sdata/web-core/_utils/responsive';

import ResponsiveObserve, { type ScreenMap } from '../../_utils/responsive-observe';
import { ResponsiveValue } from '../interface';

export function useResponsiveState(
  val: Ref<number | ResponsiveValue>,
  defaultVal: number,
  fallbackToXs = false,
) {
  const screens = ref<ScreenMap>(getScreenSnapshot());
  const state = {
    get value() {
      return val.value;
    },
    get screens() {
      return screens.value;
    },
  };
  const result = computed(() => resolveResponsiveState(state, defaultVal, fallbackToXs));

  let subscribeToken = '';

  onMounted(() => {
    subscribeToken = ResponsiveObserve.subscribe((screensVal) => {
      if (isResponsiveValue(val.value)) {
        screens.value = screensVal;
      }
    });
  });

  onUnmounted(() => {
    if (subscribeToken) {
      ResponsiveObserve.unsubscribe(subscribeToken);
    }
  });

  // prop 在数字与响应式对象之间切换时，订阅回调会因 val 非对象而跳过更新，
  // screens 会停留在过期值——切换为响应式对象时重新取一次 matchMedia 快照。
  watch(
    () => isResponsiveValue(val.value),
    (isResponsive) => {
      if (isResponsive) {
        screens.value = getScreenSnapshot();
      }
    },
  );

  return result;
}
