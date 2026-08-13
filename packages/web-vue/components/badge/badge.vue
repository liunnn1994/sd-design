<template>
  <span :class="wrapperClassName">
    <slot />

    <span v-if="$slots.content" :class="`${prefixCls}-custom-dot`" :style="computedDotStyle">
      <slot name="content" />
    </span>

    <span
      v-else-if="text && !color && !status"
      :class="`${prefixCls}-text`"
      :style="computedDotStyle"
    >
      {{ text }}
    </span>

    <span v-else-if="status || (color && !hasCount)" :class="`${prefixCls}-status-wrapper`">
      <span
        :class="[
          `${prefixCls}-status-dot`,
          {
            [`${prefixCls}-status-${status}`]: status,
            [`${prefixCls}-color-${color}`]: color,
          },
        ]"
        :style="mergedStyle"
        aria-hidden="true"
      />
      <span v-if="text" :class="`${prefixCls}-status-text`">{{ text }}</span>
    </span>

    <span
      v-else-if="(dot || color) && countValue > 0"
      role="status"
      :aria-label="String(countValue)"
      :class="[
        `${prefixCls}-dot`,
        {
          [`${prefixCls}-color-${color}`]: color,
        },
      ]"
      :style="mergedStyle"
    />

    <span v-else-if="countValue !== 0" :class="`${prefixCls}-number`" :style="mergedStyle">
      <NumberFlow :value="displayCount" :suffix="displaySuffix" :animated="animation" />
    </span>
  </span>
</template>

<script lang="ts">
  export const COLORS = [
    'red',
    'orangered',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'sdblue',
    'purple',
    'pinkpurple',
    'magenta',
    'gray',
  ] as const;

  export type ColorType = (typeof COLORS)[number];

  export const BADGE_STATUSES = ['normal', 'processing', 'success', 'warning', 'danger'] as const;
  export type BadgeStatus = (typeof BADGE_STATUSES)[number];
</script>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import type { CSSProperties } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import NumberFlow from '../number-flow';

  defineOptions({
    name: 'Badge',
  });

  const {
    text,
    dot = false,
    dotStyle,
    maxCount = 99,
    offset = [],
    color,
    status,
    count,
    animation = true,
  } = defineProps<{
    /**
     * @zh 自定义提示内容
     * @en Set the display text of the status dot
     */
    text?: string;
    /**
     * @zh 显示为小红点
     * @en Whether to display a red dot instead of `count`
     */
    dot?: boolean;
    /**
     * @zh 徽标的样式
     * @en Customize badge dot style
     */
    dotStyle?: CSSProperties;
    /**
     * @zh 徽标最大显示数值，如果count超过这个数值会显示为maxCount
     * @en Max count to show. If count is larger than this value, it will be displayed as `${maxCount}+`
     */
    maxCount?: number;
    /**
     * @zh 设置徽标位置的偏移
     * @en Set offset of the badge dot
     */
    offset?: number[];
    /**
     * @zh 内置的一些颜色
     * @en Customize dot color
     */
    color?: ColorType | string;
    /**
     * @zh 徽标的状态类型
     * @en Badge status
     * @values 'normal', 'processing', 'success', 'warning', 'danger'
     */
    status?: BadgeStatus;
    /**
     * @zh 徽标显示的数字
     * @en Number to show in badge
     */
    count?: number;
    /**
     * @zh 是否开启数字切换动画
     * @en Whether to enable the number transition animation
     */
    animation?: boolean;
  }>();

  const slots = defineSlots<{
    /**
     * @zh 徽标包裹的内容
     * @en Content wrapped by the badge
     */
    default?: () => unknown;
    /**
     * @zh 自定义徽标内容
     * @en Custom badge content
     */
    content?: () => unknown;
  }>();

  const prefixCls = getPrefixCls('badge');
  const configCtx = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configCtx?.rtl ?? false);
  const hasCount = computed(() => count != null);
  const countValue = computed(() => Number(count));

  const wrapperClassName = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-status`]: status,
      [`${prefixCls}-no-children`]: !slots.default,
      [`${prefixCls}-rtl`]: rtl.value,
    },
  ]);

  const computedDotStyle = computed<CSSProperties>(() => {
    const style = { ...dotStyle };
    const [leftOffset, topOffset] = offset;

    if (leftOffset) {
      style.marginRight = `${-leftOffset}px`;
    }
    if (topOffset) {
      style.marginTop = `${topOffset}px`;
    }

    return style;
  });

  const mergedStyle = computed<CSSProperties>(() => ({
    ...(!color || COLORS.includes(color as ColorType) ? {} : { backgroundColor: color }),
    ...computedDotStyle.value,
  }));

  const isCountOverflow = computed(() => Boolean(maxCount && countValue.value > maxCount));
  const displayCount = computed(() => (isCountOverflow.value ? maxCount : countValue.value));
  const displaySuffix = computed(() => (isCountOverflow.value ? '+' : undefined));
</script>
