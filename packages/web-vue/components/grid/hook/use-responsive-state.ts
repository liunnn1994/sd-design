import { ref, computed, watch, Ref, onUnmounted, onMounted } from 'vue';

import { isObject } from '../../_utils/is';
import ResponsiveObserve, {
  responsiveArray,
  responsiveMap,
  ScreenMap,
} from '../../_utils/responsive-observe';
import { ResponsiveValue } from '../interface';

function isResponsiveValue(val: number | ResponsiveValue): val is ResponsiveValue {
  return isObject(val);
}

// 用真实 matchMedia 快照初始化 screens，避免首帧使用全 true 造成闪烁/SSR 不匹配；
// 无 window 环境（SSR）退回全 true，保持原有 SSR 行为（取最大断点配置）。
function getScreenSnapshot(): ScreenMap {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return {
      xs: true,
      sm: true,
      md: true,
      lg: true,
      xl: true,
      xxl: true,
    };
  }
  const snapshot: ScreenMap = {};
  (Object.keys(responsiveMap) as (keyof typeof responsiveMap)[]).forEach((breakpoint) => {
    snapshot[breakpoint] = window.matchMedia(responsiveMap[breakpoint] as string).matches;
  });
  return snapshot;
}

export function useResponsiveState(
  val: Ref<number | ResponsiveValue>,
  defaultVal: number,
  fallbackToXs = false,
) {
  const screens = ref<ScreenMap>(getScreenSnapshot());
  const result = computed(() => {
    let res = defaultVal;
    if (isResponsiveValue(val.value)) {
      for (let i = 0; i < responsiveArray.length; i++) {
        const breakpoint = responsiveArray[i];
        if (
          (screens.value[breakpoint] || (breakpoint === 'xs' && fallbackToXs)) &&
          val.value[breakpoint] !== undefined
        ) {
          res = val.value[breakpoint] as number;
          break;
        }
      }
    } else {
      res = val.value;
    }
    return res;
  });

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
