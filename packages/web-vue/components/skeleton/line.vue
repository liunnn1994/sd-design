<template>
  <ul :class="prefixCls">
    <li v-for="(style, index) of lines" :key="index" :class="`${prefixCls}-row`" :style="style" />
  </ul>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { PropType } from 'vue';

  import { getSkeletonLines } from '@sdata/web-core/skeleton/foundation';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'SkeletonLine' });

  const props = defineProps({
    /**
     * @zh 展示的行数
     * @en Number of rows displayed
     */
    rows: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 线型骨架的宽度
     * @en The width of the line skeleton
     */
    widths: {
      type: Array as PropType<Array<number | string>>,
      default: () => [],
    },
    /**
     * @zh 线型骨架的行高
     * @en Line height of the line skeleton
     */
    lineHeight: {
      type: Number,
      default: 20,
    },
    /**
     * @zh 线型骨架的行间距
     * @en Line spacing of line skeleton
     */
    lineSpacing: {
      type: Number,
      default: 15,
    },
  });

  const prefixCls = getPrefixCls('skeleton-line');

  const lines = computed(() => getSkeletonLines(props));
</script>
