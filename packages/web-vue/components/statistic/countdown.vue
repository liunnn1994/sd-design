<template>
  <div :class="[`${prefixCls}`, `${prefixCls}-countdown`]">
    <div v-if="title || $slots.title" :class="`${prefixCls}-title`">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div :class="`${prefixCls}-content`">
      <div :class="`${prefixCls}-value`" :style="valueStyle">
        <template v-for="(part, index) in displayParts" :key="`${part.type}-${index}`">
          <NumberFlow
            v-if="part.type === 'number'"
            :value="Number(part.value)"
            :animated="animation"
            :format="{ minimumIntegerDigits: part.value.length, useGrouping: false }"
          />
          <template v-else>{{ part.value }}</template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    CSSProperties,
    onBeforeUnmount,
    onMounted,
    PropType,
    ref,
    toRefs,
    watch,
  } from 'vue';

  import {
    createCountdown,
    getCountdownDisplay,
    getCountdownParts,
  } from '@sdata/web-core/statistic/countdown';

  import { getPrefixCls } from '../_utils/global-config';
  import NumberFlow from '../number-flow';

  defineOptions({ name: 'Countdown' });

  const props = defineProps({
    /**
     * @zh 倒计时的标题
     * @en Countdown title
     */
    title: String,
    /**
     * @zh 倒计时的值
     * @en Countdown value
     */
    value: {
      type: Number,
      default: () => Date.now() + 300000,
    },
    /**
     * @zh 用于修正初始化时间显示不正确
     * @en Used to correct the incorrect display of the initialization time
     */
    now: {
      type: Number,
      default: () => Date.now(),
    },
    /**
     * @zh 倒计时的展示格式 [dayjs](https://day.js.org/docs/en/display/format)
     * @en Countdown display format [dayjs](https://day.js.org/docs/en/display/format)
     */
    format: {
      type: String,
      default: 'HH:mm:ss',
    },
    /**
     * @zh 是否开始倒计时
     * @en Whether to start the countdown
     */
    start: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否开启数字切换动画
     * @en Whether to enable the number transition animation
     */
    animation: {
      type: Boolean,
      default: true,
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

  const emit = defineEmits<{
    /**
     * @zh 倒计时完成后触发的回调
     * @en Callback at the end of the countdown
     */
    finish: [];
  }>();

  /**
   * @zh 标题
   * @en Title
   * @slot title
   */

  const prefixCls = getPrefixCls('statistic');
  const { start, value, now, format } = toRefs(props);

  const displayValue = ref(getCountdownDisplay(props.value, props.now, props.format));
  const displayParts = computed(() => getCountdownParts(displayValue.value));
  const foundation = createCountdown({
    props,
    get display() {
      return displayValue.value;
    },
    set display(value) {
      displayValue.value = value;
    },
    now: () => Date.now(),
    setInterval: (callback, delay) => window.setInterval(callback, delay),
    clearInterval: (timer) => window.clearInterval(timer),
    finish: () => emit('finish'),
  });
  watch([value, now, format], (_values, [previousDeadline]) =>
    foundation.syncValue(previousDeadline),
  );
  watch(start, foundation.syncStart);
  onMounted(foundation.mount);
  onBeforeUnmount(foundation.stop);
</script>
