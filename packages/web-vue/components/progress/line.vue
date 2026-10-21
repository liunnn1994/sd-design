<template>
  <div
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percentValue"
    :class="`${prefixCls}-wrapper`"
  >
    <div :class="prefixCls" :style="style">
      <div :class="`${prefixCls}-bar-buffer`" />
      <div
        :class="[`${prefixCls}-bar`, { [`${prefixCls}-bar-animate`]: animation }]"
        :style="barStyle"
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
  import { computed, PropType } from 'vue';

  import {
    createProgressLineFoundation,
    getProgressPercent,
    getProgressText,
  } from '@sdata/web-core/progress/foundation';

  import { Status } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import IconExclamationCircleFill from '../icon/icon-exclamation-circle-fill';

  defineOptions({ name: 'ProgressLine' });

  const props = defineProps({
    percent: {
      type: Number,
      default: 0,
    },
    animation: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    strokeWidth: {
      type: Number,
    },
    width: {
      type: [Number, String],
      default: '100%',
    },
    color: {
      type: [String, Object],
      default: undefined,
    },
    trackColor: String,
    formatText: {
      type: Function,
      default: undefined,
    },
    status: {
      type: String as PropType<Status>,
    },
    showText: Boolean,
  });

  const prefixCls = getPrefixCls('progress-line');

  const foundation = createProgressLineFoundation(props);
  const percentValue = computed(() => getProgressPercent(props.percent));
  const text = computed(() => getProgressText(props.percent));
  const style = computed(foundation.getStyle);
  const barStyle = computed(foundation.getBarStyle);
</script>
