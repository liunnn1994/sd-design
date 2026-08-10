<template>
  <DefineHandler>
    <div
      ref="handlerRef"
      :class="`${prefixCls}-handler`"
      :style="{
        left: `${x * 100}%`,
        color: colorString,
      }"
    />
  </DefineHandler>

  <div v-if="type === 'alpha'" :class="`${prefixCls}-control-bar-bg`" v-bind="$attrs">
    <div
      ref="blockRef"
      :class="[`${prefixCls}-control-bar`, `${prefixCls}-control-bar-alpha`]"
      :style="{
        background: `linear-gradient(to right, rgba(0, 0, 0, 0), rgb(${rgb.r}, ${rgb.g}, ${rgb.b}))`,
      }"
      @mousedown="onMouseDown"
    >
      <ReuseHandler />
    </div>
  </div>
  <div
    v-else
    ref="blockRef"
    :class="[`${prefixCls}-control-bar`, `${prefixCls}-control-bar-hue`]"
    v-bind="$attrs"
    @mousedown="onMouseDown"
  >
    <ReuseHandler />
  </div>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { Color } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { useControlBlock } from './hooks/use-control-block';

  defineOptions({
    name: 'ControlBar',
    inheritAttrs: false,
  });

  const props = defineProps({
    x: {
      type: Number,
      required: true,
    },
    color: {
      type: Object as PropType<Color>,
      required: true,
    },
    colorString: String,
    type: String as PropType<'hue' | 'alpha'>,
    onChange: Function as PropType<(x: number) => void>,
  });

  const prefixCls = getPrefixCls('color-picker');
  const rgb = computed(() => props.color.rgb);
  const [DefineHandler, ReuseHandler] = createReusableTemplate();

  const { blockRef, handlerRef, onMouseDown } = useControlBlock({
    value: [props.x, 0],
    onChange: (pos) => props.onChange?.(pos[0]),
  });
</script>
