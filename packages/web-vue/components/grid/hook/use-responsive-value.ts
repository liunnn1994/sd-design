import { computed, Ref } from 'vue';

import { resolveResponsiveValue } from '@sdata/web-core/_utils/responsive';

import type { ColResponsiveConfig } from '../interface';

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
  const value = computed(() => resolveResponsiveValue(props.value));
  return value;
}
