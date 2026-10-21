<template>
  <div :class="cls">
    <div ref="trackRef" :class="trackCls" @click="handleClick">
      <div :class="`${prefixCls}-bar`" :style="getBarStyle(computedValue)" />
      <slider-ticks
        v-if="showTicks"
        :value="computedValue"
        :step="step"
        :min="min"
        :max="max"
        :direction="direction"
      />
      <slider-dots v-if="marks" :data="markList" :min="min" :max="max" :direction="direction" />
      <slider-marks v-if="marks" :data="markList" :min="min" :max="max" :direction="direction" />
      <slider-button
        v-if="range"
        :style="getBtnStyle(computedValue[0])"
        :value="computedValue[0]"
        :direction="direction"
        :disabled="mergedDisabled"
        :min="min"
        :max="max"
        :format-tooltip="formatTooltip"
        :show-tooltip="showTooltip"
        @movestart="handleMoveStart"
        @moving="handleStartMoving"
        @keydown="(e) => handleButtonKeydown('start', e)"
      />
      <slider-button
        :style="getBtnStyle(computedValue[1])"
        :value="computedValue[1]"
        :direction="direction"
        :disabled="mergedDisabled"
        :min="min"
        :max="max"
        :format-tooltip="formatTooltip"
        :show-tooltip="showTooltip"
        @movestart="handleMoveStart"
        @moving="handleEndMoving"
        @keydown="(e) => handleButtonKeydown('end', e)"
      />
    </div>
    <slider-input
      v-if="showInput"
      :model-value="computedValue"
      :min="min"
      :max="max"
      :step="step"
      :range="range"
      :disabled="mergedDisabled"
      @start-change="handleStartChange"
      @end-change="handleEndChange"
    />
  </div>
</template>

<script setup lang="ts">
  import type { PropType, CSSProperties } from 'vue';
  import { computed, ref, toRef, toRefs, watch } from 'vue';

  import {
    getSliderInitialValues,
    getSliderMarks,
    getSliderBarStyle,
  } from '@sdata/web-core/slider/data';
  import { createSliderFoundation } from '@sdata/web-core/slider/foundation';

  import { useFormItem } from '../_hooks/use-form-item';
  import { Direction } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import SliderButton from './slider-button.vue';
  import SliderDots from './slider-dots.vue';
  import SliderInput from './slider-input.vue';
  import SliderMarks from './slider-marks.vue';
  import SliderTicks from './slider-ticks.vue';
  import { getOffsetPercent, getPositionStyle } from './utils';

  defineOptions({ name: 'Slider' });

  const props = defineProps({
    /**
     * @zh 绑定值
     * @en Value
     * @vModel
     */
    modelValue: {
      type: [Number, Array] as PropType<number | [number, number]>,
      default: undefined,
    },
    /**
     * @zh 默认值（非受控状态）
     * @en Default value (uncontrolled state)
     */
    defaultValue: {
      type: [Number, Array] as PropType<number | [number, number]>,
      default: 0,
    },
    /**
     * @zh 滑动的步长
     * @en Sliding step
     */
    step: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 滑动范围的最小值
     * @en Minimum sliding range
     */
    min: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 设置显示的标签
     * @en Set the displayed label
     */
    marks: {
      type: Object as PropType<Record<number, string>>,
    },
    /**
     * @zh 滑动范围的最大值
     * @en Maximum sliding range
     */
    max: {
      type: Number,
      default: 100,
    },
    /**
     * @zh 滑动输入条的方向
     * @en The direction of the slider
     */
    direction: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示刻度线
     * @en Whether to show ticks
     */
    showTicks: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示输入框
     * @en Whether to show the input
     */
    showInput: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否开启范围选择
     * @en Whether to use range selection
     */
    range: {
      type: Boolean,
      default: false,
    },
    formatTooltip: {
      type: Function,
    },
    /**
     * @zh 是否显示tooltip
     * @en Whether to show tooltip
     * @version 2.42.0
     */
    showTooltip: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: number | [number, number]];
    /**
     * @zh 值改变时触发
     * @en Trigger when the value changes
     * @param {number | [number, number]} value
     */
    'change': [_value: number | [number, number]];
  }>();

  const { modelValue } = toRefs(props);
  const prefixCls = getPrefixCls('slider');
  const { mergedDisabled, eventHandlers } = useFormItem({
    disabled: toRef(props, 'disabled'),
  });

  const trackRef = ref<HTMLElement | null>(null);
  const trackRect = ref<DOMRect>();
  const [initialStart, initialEnd] = getSliderInitialValues(props.modelValue, props.defaultValue);
  const startValue = ref(initialStart);
  const endValue = ref(initialEnd);
  const foundation = createSliderFoundation({
    get options() {
      return props;
    },
    get start() {
      return startValue.value;
    },
    get end() {
      return endValue.value;
    },
    get display() {
      return computedValue.value;
    },
    get rect() {
      return trackRect.value;
    },
    isDisabled: () => mergedDisabled.value,
    setStart: (value) => {
      startValue.value = value;
    },
    setEnd: (value) => {
      endValue.value = value;
    },
    measure: () => {
      if (trackRef.value) trackRect.value = trackRef.value.getBoundingClientRect();
    },
    onUpdate: (value) => emit('update:modelValue', value),
    onChange: (value) => emit('change', value),
    onFormChange: () => eventHandlers.value?.onChange?.(),
  });
  watch(modelValue!, foundation.syncModel);
  const computedValue = computed(foundation.getValue);
  const markList = computed(() => getSliderMarks(props.marks, computedValue.value));
  const handleStartChange = foundation.startChange;
  const handleEndChange = foundation.endChange;
  const handleButtonKeydown = foundation.keydown;
  const handleMoveStart = foundation.moveStart;
  const handleStartMoving = foundation.startMoving;
  const handleEndMoving = foundation.endMoving;
  const handleClick = foundation.click;
  const getBtnStyle = (value: number) =>
    getPositionStyle(getOffsetPercent(value, [props.min, props.max]), props.direction);
  const getBarStyle = (value: [number, number]): CSSProperties => getSliderBarStyle(value, props);

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-vertical`]: props.direction === 'vertical',
      [`${prefixCls}-with-marks`]: Boolean(props.marks),
    },
  ]);

  const trackCls = computed(() => [
    `${prefixCls}-track`,
    {
      [`${prefixCls}-track-disabled`]: mergedDisabled.value,
      [`${prefixCls}-track-vertical`]: props.direction === 'vertical',
    },
  ]);
</script>
