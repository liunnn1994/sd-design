<template>
  <div v-if="visible" :class="classNames" :style="styles">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, PropType } from 'vue';

  import {
    getAllowableFlexValue,
    getGridColumnClassNames,
    getGridColumnPadding,
  } from '@sdata/web-core/grid/column';

  import { getPrefixCls } from '../_utils/global-config';
  import pick from '../_utils/pick';
  import { responsiveArray } from '../_utils/responsive-observe';
  import { RowContextInjectionKey } from './context';
  import { useResponsiveState } from './hook/use-responsive-state';
  import { useResponsiveValue } from './hook/use-responsive-value';
  import { FlexType, ColResponsiveConfig } from './interface';

  defineOptions({ name: 'Col' });

  const props = defineProps({
    /**
     * @zh 栅格占位格数
     * @en Number of grid space
     */
    span: {
      type: Number,
      default: 24,
    },
    /**
     * @zh 栅格左侧的间隔格数，间隔内不可以有栅格
     * @en The number of grids on the left side of the grid. There can be no grids in the grid.
     */
    offset: {
      type: Number,
    },
    /**
     * @zh 对元素进行排序
     * @en Sort elements
     */
    order: {
      type: Number,
    },
    /**
     * @zh < 576px 响应式栅格
     * @en <576px responsive grid
     */
    xs: {
      type: [Number, Object] as PropType<number | ColResponsiveConfig>,
    },
    /**
     * @zh >= 576px 响应式栅格
     * @en >=576px responsive grid
     */
    sm: {
      type: [Number, Object] as PropType<number | { [key: string]: unknown }>,
    },
    /**
     * @zh >= 768px 响应式栅格
     * @en >=768px responsive grid
     */
    md: {
      type: [Number, Object] as PropType<number | { [key: string]: unknown }>,
    },
    /**
     * @zh >= 992px 响应式栅格
     * @en >=992px responsive grid
     */
    lg: {
      type: [Number, Object] as PropType<number | { [key: string]: unknown }>,
    },
    /**
     * @zh >= 1200px 响应式栅格
     * @en >=1200px responsive grid
     */
    xl: {
      type: [Number, Object] as PropType<number | { [key: string]: unknown }>,
    },
    /**
     * @zh >= 1600px 响应式栅格
     * @en >=1600px responsive grid
     */
    xxl: {
      type: [Number, Object] as PropType<number | { [key: string]: unknown }>,
    },
    /**
     * @zh 设置 flex 布局属性
     * @en Set flex layout properties
     * @version 2.10.0
     */
    flex: {
      type: [Number, String] as PropType<number | string | 'initial' | 'auto' | 'none'>,
    },
  });

  const prefixCls = getPrefixCls('col');
  const rowContext = inject(RowContextInjectionKey, {});

  const flexValue = computed(() => getAllowableFlexValue(props.flex));
  const mergeClassName = computed(() => getGridColumnClassNames(prefixCls, props, rowContext));
  const classNames = computed(() => {
    if (rowContext.div) return undefined;
    return flexValue.value !== undefined ? prefixCls : mergeClassName.value;
  });
  const paddingStyles = computed(() => getGridColumnPadding(rowContext));
  const flexStyles = computed<{ flex?: FlexType }>(() =>
    flexValue.value !== undefined ? { flex: flexValue.value } : {},
  );

  const responsiveConfig = computed(() => pick(props, responsiveArray));
  const propSpan = useResponsiveValue(
    computed(() => ({
      val: props.span,
      key: 'span',
      ...responsiveConfig.value,
    })),
  );
  const responsiveSpan = useResponsiveState(propSpan, 24, true);

  const visible = computed(() => rowContext.div || !!responsiveSpan.value);
  const styles = computed(() =>
    rowContext.div ? {} : { ...paddingStyles.value, ...flexStyles.value },
  );
</script>
