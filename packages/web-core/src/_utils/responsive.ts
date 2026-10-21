import type { ScreenMap, SiderBreakpoint } from './responsive-observe.js';

import { isObject, isNumber, isNull, isUndefined } from './is.js';
import observer, { responsiveArray, responsiveMap } from './responsive-observe.js';
export interface ResponsiveValue {
  /**
   * @zh >= 1600px 响应式配置
   * @en >= 1600px responsive configuration
   */
  xxl?: number;
  /**
   * @zh >= 1200px 响应式配置
   * @en >= 1200px responsive configuration
   */
  xl?: number;
  /**
   * @zh >= 992px 响应式配置
   * @en >= 992px responsive configuration
   */
  lg?: number;
  /**
   * @zh >= 768px 响应式配置
   * @en >= 768px responsive configuration
   */
  md?: number;
  /**
   * @zh >= 576px 响应式配置
   * @en >= 576px responsive configuration
   */
  sm?: number;
  /**
   * @zh < 576px 响应式配置
   * @en <576px responsive configuration
   */
  xs?: number;
}
export interface ColResponsiveConfig {
  span?: number;
  offset?: number;
  order?: number;
}
export function isResponsiveValue(val: number | ResponsiveValue): val is ResponsiveValue {
  return isObject(val);
}
export function getScreenSnapshot(): ScreenMap {
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
export function resolveResponsiveState(
  state: { value: number | ResponsiveValue; screens: ScreenMap },
  defaultVal: number,
  fallbackToXs = false,
) {
  let res = defaultVal;
  if (isResponsiveValue(state.value)) {
    for (let i = 0; i < responsiveArray.length; i++) {
      const breakpoint = responsiveArray[i];
      if (
        (state.screens[breakpoint] || (breakpoint === 'xs' && fallbackToXs)) &&
        state.value[breakpoint] !== undefined
      ) {
        res = state.value[breakpoint] as number;
        break;
      }
    }
  } else {
    res = state.value;
  }
  return res;
}
export interface ResponsiveProps {
  val: number;
  key: string;
  xs?: number | ColResponsiveConfig | undefined;
  sm?: number | ColResponsiveConfig | undefined;
  md?: number | ColResponsiveConfig | undefined;
  lg?: number | ColResponsiveConfig | undefined;
  xl?: number | ColResponsiveConfig | undefined;
  xxl?: number | ColResponsiveConfig | undefined;
}
const hasBreakpointValue = (value: unknown) => !isUndefined(value) && !isNull(value);
export function resolveResponsiveValue(props: ResponsiveProps) {
  const { val, key, xs, sm, md, lg, xl, xxl } = props;
  if (
    !hasBreakpointValue(xs) &&
    !hasBreakpointValue(sm) &&
    !hasBreakpointValue(md) &&
    !hasBreakpointValue(lg) &&
    !hasBreakpointValue(xl) &&
    !hasBreakpointValue(xxl)
  ) {
    return val;
  }
  const result: ResponsiveValue = {};
  responsiveArray.forEach((breakpoint) => {
    const config = props[breakpoint];
    if (isNumber(config)) {
      result[breakpoint] = config;
    } else if (isObject(config) && isNumber((config as Record<string, unknown>)[key])) {
      result[breakpoint] = (config as Record<string, unknown>)[key] as number;
    }
  });
  return result;
}
export function createResponsiveSubscription(
  state: { breakpoint: SiderBreakpoint | undefined },
  callback: (checked: boolean) => void,
) {
  let subscribeToken = '';
  let latestScreens: ScreenMap = {};
  return {
    mount() {
      subscribeToken = observer.subscribe((screens, breakpointChecked) => {
        latestScreens = screens;
        if (!state.breakpoint) return;
        if (!breakpointChecked || breakpointChecked === state.breakpoint)
          callback(!!screens[state.breakpoint]);
      });
    },
    refresh(nextBreakpoint: SiderBreakpoint | undefined) {
      if (subscribeToken && nextBreakpoint) callback(!!latestScreens[nextBreakpoint]);
    },
    dispose() {
      if (subscribeToken) observer.unsubscribe(subscribeToken);
    },
  };
}
