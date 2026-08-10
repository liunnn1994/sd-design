<template>
  <button
    ref="thumbRef"
    type="button"
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
  const shouldIgnoreClick = ref(false);

  useDraggable(thumbRef, {
    axis: 'x',
    buttons: [0, -1],
    disabled: computed(() => props.disabled),
    preventDefault: true,
    stopPropagation: true,
    onStart: () => {
      props.onSelect?.();
      shouldIgnoreClick.value = false;
    },
    onMove: (_, event) => {
      shouldIgnoreClick.value = true;
      props.onMove?.(event.clientX);
    },
    onEnd: () => {
      window.setTimeout(() => {
        shouldIgnoreClick.value = false;
      }, 0);
    },
  });

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!shouldIgnoreClick.value) props.onSelect?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') props.onRemove?.();
  };
</script>
