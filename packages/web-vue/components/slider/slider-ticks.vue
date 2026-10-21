<template>
  <div :class="`${prefixCls}-ticks`">
    <div
      v-for="(item, index) of steps"
      :key="index"
      :class="[`${prefixCls}-tick`, { [`${prefixCls}-tick-active`]: item.isActive }]"
      :style="getStyle(item.key)"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue';

  import { getSliderTicks } from '@sdata/web-core/slider/data';

  import { Direction } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { getOffsetPercent, getPositionStyle } from './utils';

  defineOptions({ name: 'SliderTicks' });

  const props = defineProps({
    value: {
      type: Array as unknown as PropType<[number, number]>,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    direction: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
  });

  const prefixCls = getPrefixCls('slider');

  const steps = computed(() => getSliderTicks(props.value, props.min, props.max, props.step));

  const getStyle = (value: number) =>
    getPositionStyle(getOffsetPercent(value, [props.min, props.max]), props.direction);
</script>
