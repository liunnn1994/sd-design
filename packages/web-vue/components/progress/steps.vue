<template>
  <div
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percentValue"
    :class="`${prefixCls}-wrapper`"
  >
    <div :class="prefixCls" :style="{ height: `${mergedStrokeWidth}px` }">
      <div
        v-for="(active, index) of stepList"
        :key="index"
        :class="[
          `${prefixCls}-item`,
          {
            [`${prefixCls}-item-active`]: active,
          },
        ]"
        :style="getStepStyle(active)"
      />
    </div>
    <div v-if="showText" :class="`${prefixCls}-text`">
      <slot name="text" :percent="percent">
        {{ text }}
        <icon-exclamation-circle-fill v-if="status === 'danger'" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType, type CSSProperties } from 'vue';

  import {
    createProgressStepsFoundation,
    getProgressPercent,
    getProgressText,
  } from '@sdata/web-core/progress/foundation';

  import { getPrefixCls } from '../_utils/global-config';
  import IconExclamationCircleFill from '../icon/icon-exclamation-circle-fill';

  defineOptions({ name: 'ProgressSteps' });

  const props = defineProps({
    steps: {
      type: Number,
      default: 0,
    },
    percent: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
    },
    color: {
      type: [String, Object],
      default: undefined,
    },
    trackColor: String,
    strokeWidth: {
      type: Number,
    },
    status: {
      type: String,
      default: undefined,
    },
    showText: {
      type: Boolean,
      default: true,
    },
  });

  const prefixCls = getPrefixCls('progress-steps');
  const foundation = createProgressStepsFoundation(props);
  const mergedStrokeWidth = computed(foundation.getStrokeWidth);
  const stepList = computed(foundation.getSteps);
  const percentValue = computed(() => getProgressPercent(props.percent));
  const text = computed(() => getProgressText(props.percent));
  const getStepStyle = (active: boolean): CSSProperties => foundation.getStepStyle(active);
</script>
