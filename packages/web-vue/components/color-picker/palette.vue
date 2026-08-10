<template>
  <div
    ref="blockRef"
    :class="`${prefixCls}-palette`"
    :style="{ backgroundColor: hueColor }"
    @mousedown="onMouseDown"
  >
    <div
      ref="handlerRef"
      :class="`${prefixCls}-handler`"
      :style="{
        top: `${(1 - hsv.v) * 100}%`,
        left: `${hsv.s * 100}%`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import type { Color } from './interface';

  import { hsvToRgb } from '../_utils/color';
  import { getPrefixCls } from '../_utils/global-config';
  import { useControlBlock } from './hooks/use-control-block';

  defineOptions({ name: 'Palette' });

  const props = defineProps({
    color: {
      type: Object as PropType<Color>,
      required: true,
    },
    onChange: Function as PropType<(s: number, v: number) => void>,
  });

  const prefixCls = getPrefixCls('color-picker');
  const hsv = computed(() => props.color.hsv);

  const { blockRef, handlerRef, onMouseDown } = useControlBlock({
    value: [hsv.value.s, 1 - hsv.value.v],
    onChange: (value) => props.onChange?.(value[0], 1 - value[1]),
  });

  const hueColor = computed(() => {
    const rgb = hsvToRgb(hsv.value.h, 1, 1);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  });
</script>
