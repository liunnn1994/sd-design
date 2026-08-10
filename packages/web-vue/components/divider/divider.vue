<template>
  <div
    role="separator"
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
  import type { CSSProperties } from 'vue';

  import type { Direction } from '../_utils/constant';

  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber, isUndefined } from '../_utils/is';

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
  const isHorizontal = computed(() => direction === 'horizontal');

  const mergedStyles = computed<CSSProperties>(() => {
    const styles: CSSProperties = {};

    if (size) {
      if (isHorizontal.value) {
        styles.borderBottomWidth = `${size}px`;
      } else {
        styles.borderLeftWidth = `${size}px`;
      }
    }

    if (type) {
      if (isHorizontal.value) {
        styles.borderBottomStyle = type;
      } else {
        styles.borderLeftStyle = type;
      }
    }

    if (!isUndefined(margin)) {
      const mergedMargin = isNumber(margin) ? `${margin}px` : margin;
      styles.margin = isHorizontal.value ? `${mergedMargin} 0` : `0 ${mergedMargin}`;
    }

    return styles;
  });
</script>
