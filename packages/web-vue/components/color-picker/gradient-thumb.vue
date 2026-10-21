<template>
  <button
    ref="thumbRef"
    type="button"
    :disabled="props.disabled"
    :class="[
      `${props.prefixCls}-gradient-thumb`,
      { [`${props.prefixCls}-gradient-thumb-active`]: props.active },
    ]"
    :style="{ left: `${props.point.left}%` }"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <span
      :class="`${props.prefixCls}-gradient-thumb-inner`"
      :style="{ backgroundColor: formatColor(props.point.hsva, 'CSS', true) }"
    />
  </button>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { createGradientThumb } from '@sdata/web-core/color-picker/control';
  import { useDraggable } from '@vueuse/core';

  import type { GradientColorPoint } from './interface';

  import { formatColor } from './utils';

  defineOptions({ name: 'GradientThumb' });

  const props = defineProps<{
    point: GradientColorPoint;
    prefixCls: string;
    active?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
    onMove?: (clientX: number) => void;
    onRemove?: () => void;
  }>();

  const thumbRef = ref<HTMLElement>();
  const thumb = createGradientThumb({
    props,
    schedule: (callback) => {
      window.setTimeout(callback, 0);
    },
  });

  useDraggable(thumbRef, {
    axis: 'x',
    buttons: [0, -1],
    disabled: computed(() => props.disabled),
    preventDefault: true,
    stopPropagation: true,
    onStart: thumb.start,
    onMove: (_, event) => thumb.move(event.clientX),
    onEnd: thumb.end,
  });

  const handleClick = thumb.click;
  const handleKeyDown = thumb.keydown;
</script>
