<template>
  <div :class="prefixCls">
    <div v-if="title || $slots.title" :class="`${prefixCls}-title`">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div :class="`${prefixCls}-content`">
      <div :class="`${prefixCls}-value`" :style="valueStyle">
        <span v-if="showPlaceholder">{{ placeholder }}</span>
        <template v-else>
          <span v-if="$slots.prefix" :class="`${prefixCls}-prefix`">
            <slot name="prefix" />
          </span>
          <NumberFlow
            v-if="isNumber(displayValue)"
            :value="displayValue"
            :animated="animation"
            :format="numberFormat"
            :transform-timing="{ duration: animationDuration }"
          />
          <template v-else>
            {{ formattedDateValue }}
          </template>
          <span v-if="$slots.suffix" :class="`${prefixCls}-suffix`">
            <slot name="suffix" />
          </span>
        </template>
      </div>
      <div v-if="extra || $slots.extra" :class="`${prefixCls}-extra`">
        <slot name="extra">
          {{ extra }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, CSSProperties, nextTick, onMounted, PropType, shallowRef, watch } from 'vue';

  import dayjs from 'dayjs';

  import type { NumberFlowFormat } from '../number-flow';

  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber, isUndefined } from '../_utils/is';
  import NumberFlow from '../number-flow';

  defineOptions({ name: 'Statistic' });

  const props = defineProps({
    /**
     * @zh 数值显示的标题
     * @en Title of the numerical display
     */
    title: String,
    /**
     * @zh 数值显示的值
     * @en Numerical display value
     */
    value: {
      type: [Number, Object] as PropType<number | Date>,
    },
    /**
     * @zh 数值显示的格式 [dayjs](https://day.js.org/docs/en/display/format)（日期模式使用）
     * @en Format of numerical display [dayjs](https://day.js.org/docs/en/display/format) (used in date mode)
     */
    format: {
      type: String,
      default: 'HH:mm:ss',
    },
    /**
     * @zh 额外的显示内容
     * @en Additional display content
     */
    extra: String,
    /**
     * @zh 是否开始动画
     * @en Whether to start animation
     */
    start: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 小数保留位数（数字模式使用）
     * @en Decimal reserved digits (used in digital mode)
     */
    precision: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 进位分隔符（数字模式使用）
     * @en Carry separator (used in number mode)
     */
    separator: String,
    /**
     * @zh 是否展示进位分隔符（数字模式使用）
     * @en Whether to display the carry separator (used in number mode)
     */
    showGroupSeparator: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否开启动画
     * @en Whether to turn on animation
     */
    animation: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 动画的过度时间
     * @en Animation's duration time
     */
    animationDuration: {
      type: Number,
      default: 2000,
    },
    /**
     * @zh 动画的起始值
     * @en The starting value of the animation
     */
    valueFrom: {
      type: Number,
      default: undefined,
    },
    /**
     * @zh 提示文字（当 value 为 undefined 时显示）
     * @en Prompt text (displayed when value is undefined )
     * @version 2.28.0
     */
    placeholder: {
      type: String,
    },
    /**
     * @zh 自定义显示值的样式
     * @en Custom value style
     * @version 2.32.0
     */
    valueStyle: {
      type: Object as PropType<CSSProperties>,
    },
  });

  /**
   * @zh 标题
   * @en Title
   * @slot title
   */
  /**
   * @zh 额外内容
   * @en Extra content
   * @slot extra
   */
  /**
   * @zh 前缀
   * @en Prefix
   * @slot prefix
   */
  /**
   * @zh 后缀
   * @en Suffix
   * @slot suffix
   */

  const prefixCls = getPrefixCls('statistic');
  const showPlaceholder = computed(() => isUndefined(props.value));
  const displayValue = shallowRef<number | Date | undefined>(
    props.animation && props.valueFrom !== undefined ? props.valueFrom : props.value,
  );
  const numberFormat = computed<NumberFlowFormat>(() => ({
    minimumFractionDigits: props.precision,
    maximumFractionDigits: props.precision,
    useGrouping: props.showGroupSeparator,
  }));
  const formattedDateValue = computed(() =>
    props.format ? dayjs(displayValue.value).format(props.format) : displayValue.value,
  );

  onMounted(async () => {
    if (props.animation && props.start && props.valueFrom !== undefined) {
      await nextTick();
      displayValue.value = props.value;
    }
  });

  watch(
    () => props.start,
    (value) => {
      if (value) displayValue.value = props.value;
    },
  );

  watch(
    () => props.value,
    (value) => {
      displayValue.value = value;
    },
  );
</script>
