<template>
  <div
    role="separator"
    :aria-orientation="direction"
    :class="[
      prefixCls,
      `${prefixCls}-${direction}`,
      {
        [`${prefixCls}-with-text`]: $slots.default,
      },
    ]"
    :style="mergedStyles"
  >
    <span
      v-if="$slots.default && direction === 'horizontal'"
      :class="[`${prefixCls}-text`, `${prefixCls}-text-${orientation}`]"
    >
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getDividerStyle } from '@sdata/web-core/divider/foundation';

  import type { Direction } from '../_utils/constant';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({
    name: 'Divider',
  });

  const {
    direction = 'horizontal',
    orientation = 'center',
    type,
    size,
    margin,
  } = defineProps<{
    /**
     * @zh 分割线的方向，是水平还是竖直
     * @en The direction of the dividing line. Can be horizontal or vertical
     * @values 'horizontal','vertical'
     */
    direction?: Direction;
    /**
     * @zh 分割线文字的位置
     * @en The position of the dividing line text
     */
    orientation?: 'left' | 'center' | 'right';
    /**
     * @zh 分割线样式类型
     * @en Dividing line style type
     * @version 2.35.0
     */
    type?: 'solid' | 'dashed' | 'dotted' | 'double';
    /**
     * @zh 分割线宽度/高度
     * @en The wide/height of the dividing line
     * @version 2.35.0
     */
    size?: number;
    /**
     * @zh 分割线上下 margin (垂直方向时为左右 margin)
     * @en Margin up and down the split line (left and right margin in vertical direction)
     * @version 2.35.0
     */
    margin?: number | string;
  }>();

  const prefixCls = getPrefixCls('divider');
  const mergedStyles = computed(() => getDividerStyle({ direction, type, size, margin }));
</script>
