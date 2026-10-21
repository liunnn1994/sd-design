<template>
  <div
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percentValue"
    :class="`${prefixCls}-wrapper`"
    :style="{ width: `${mergedWidth}px`, height: `${mergedWidth}px` }"
  >
    <icon-check
      v-if="type === 'circle' && size === 'mini' && status === 'success'"
      :style="iconStyle"
    />
    <svg v-else :viewBox="`0 0 ${mergedWidth} ${mergedWidth}`" :class="`${prefixCls}-svg`">
      <defs v-if="isLinearGradient">
        <linearGradient :id="linearGradientId" x1="0" y1="1" x2="0" y2="0">
          <stop
            v-for="[offset, stopColor] of gradientStops"
            :key="offset"
            :offset="offset"
            :stop-color="stopColor"
          />
        </linearGradient>
      </defs>
      <circle
        :class="`${prefixCls}-bg`"
        fill="none"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="mergedPathStrokeWidth"
        :style="trackStyle"
      />
      <circle
        :class="`${prefixCls}-bar`"
        fill="none"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="mergedStrokeWidth"
        :style="circleStyle"
      />
    </svg>
    <div v-if="showText && size !== 'mini'" :class="`${prefixCls}-text`">
      <slot name="text" :percent="percent">
        <icon-exclamation v-if="status === 'danger'" />
        <icon-check v-else-if="status === 'success'" />
        <template v-else>
          {{ text }}
        </template>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType, useId, type CSSProperties } from 'vue';

  import {
    createProgressCircleFoundation,
    getProgressPercent,
    getProgressText,
  } from '@sdata/web-core/progress/foundation';

  import { SIZES } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import IconCheck from '../icon/icon-check';
  import IconExclamation from '../icon/icon-exclamation';

  defineOptions({ name: 'ProgressCircle' });

  const props = defineProps({
    percent: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
    },
    size: {
      type: String as PropType<(typeof SIZES)[number]>,
      default: 'medium',
    },
    strokeWidth: {
      type: Number,
    },
    width: {
      type: Number,
      default: undefined,
    },
    color: {
      type: [String, Object],
      default: undefined,
    },
    trackColor: String,
    status: {
      type: String,
      default: undefined,
    },
    showText: {
      type: Boolean,
      default: true,
    },
    pathStrokeWidth: {
      type: Number,
    },
  });

  const prefixCls = getPrefixCls('progress-circle');

  const linearGradientId = `${prefixCls}-linear-gradient-${useId()}`;
  const foundation = createProgressCircleFoundation(props, () => linearGradientId);
  const isLinearGradient = computed(foundation.isLinearGradient);
  const gradientStops = computed(foundation.getGradientStops);
  const mergedWidth = computed(foundation.getWidth);
  const mergedStrokeWidth = computed(foundation.getStrokeWidth);
  const mergedPathStrokeWidth = computed(foundation.getPathStrokeWidth);
  const radius = computed(foundation.getRadius);
  const center = computed(foundation.getCenter);
  const percentValue = computed(() => getProgressPercent(props.percent));
  const text = computed(() => getProgressText(props.percent));
  const iconStyle = computed<CSSProperties>(foundation.getIconStyle);
  const trackStyle = computed<CSSProperties>(foundation.getTrackStyle);
  const circleStyle = computed<CSSProperties>(foundation.getCircleStyle);
</script>
