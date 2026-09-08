import { computed, Ref } from 'vue';

import type { ColResponsiveConfig, ResponsiveValue } from '../interface';

import { isNull, isNumber, isObject, isUndefined } from '../../_utils/is';
import { responsiveArray } from '../../_utils/responsive-observe';

// 数字断点值 0 是合法配置（如 xs={0} 隐藏列），必须用显式 undefined/null 判断而非 falsy 守卫
const hasBreakpointValue = (value: unknown): boolean => !isUndefined(value) && !isNull(value);

export function useResponsiveValue(
  props: Ref<{
    val: number;
    key: string;
    xs?: number | ColResponsiveConfig;
    sm?: number | ColResponsiveConfig;
    md?: number | ColResponsiveConfig;
    lg?: number | ColResponsiveConfig;
    xl?: number | ColResponsiveConfig;
    xxl?: number | ColResponsiveConfig;
  }>,
) {
  const value = computed(() => {
    const { val, key, xs, sm, md, lg, xl, xxl } = props.value;
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
      const config = props.value[breakpoint];
      if (isNumber(config)) {
        result[breakpoint] = config;
      } else if (isObject(config) && isNumber((config as Record<string, any>)[key])) {
        result[breakpoint] = (config as Record<string, any>)[key];
      }
    });
    return result;
  });
  return value;
}
