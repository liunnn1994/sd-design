<template>
  <tooltip
    :popup-visible="popupVisible"
    :position="mergedTooltipPosition"
    :content="tooltipContent"
  >
    <div
      v-bind="$attrs"
      :tabindex="disabled ? -1 : 0"
      role="slider"
      :aria-disabled="disabled"
      :aria-valuemax="max"
      :aria-valuemin="min"
      :aria-valuenow="value"
      :aria-valuetext="tooltipContent"
      :class="cls"
      @mousedown="handleMouseDown"
      @touchstart="handleMouseDown"
      @contextmenu.prevent
      @click.stop
      @keydown="onKeydown"
    />
  </tooltip>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, PropType, ref, watch } from 'vue';

  import { createSliderDragFoundation } from '@sdata/web-core/slider/drag';

  import type { TriggerPosition } from '../_utils/constant';

  import { DIRECTIONS } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'SliderButton', inheritAttrs: false });

  const props = defineProps({
    direction: {
      type: String as PropType<(typeof DIRECTIONS)[number]>,
      default: 'horizontal',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    formatTooltip: {
      type: Function,
    },
    value: [String, Number],
    tooltipPosition: {
      type: String as PropType<TriggerPosition>,
    },
    showTooltip: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    movestart: [];
    moving: [_x: number, _y: number];
    moveend: [];
    keydown: [_e: KeyboardEvent];
  }>();

  const prefixCls = getPrefixCls('slider-btn');
  const isDragging = ref(false);

  const onKeydown = (e: KeyboardEvent) => {
    if (!props.disabled) {
      emit('keydown', e);
    }
  };

  const drag = createSliderDragFoundation({
    getTarget: () => window,
    isDisabled: () => props.disabled,
    setDragging: (value) => {
      isDragging.value = value;
    },
    onStart: () => emit('movestart'),
    onMove: (x, y) => emit('moving', x, y),
    onEnd: () => emit('moveend'),
  });
  const handleMouseDown = drag.start;
  const cleanupDragging = drag.cleanup;

  watch(
    () => props.disabled,
    (disabled) => {
      if (disabled) cleanupDragging();
    },
  );

  onBeforeUnmount(cleanupDragging);

  const cls = computed(() => [prefixCls]);

  const mergedTooltipPosition = computed(
    () => props.tooltipPosition ?? (props.direction === 'vertical' ? 'right' : 'top'),
  );

  const tooltipContent = computed(() => props.formatTooltip?.(props.value) ?? `${props.value}`);

  const popupVisible = computed(() =>
    props.showTooltip ? (isDragging.value ? true : undefined) : false,
  );
</script>
