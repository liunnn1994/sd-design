<template>
  <div
    ref="root"
    :class="prefixCls"
    :data-state="state"
    :data-autoplay="autoplay && !disabled && duration > 0"
  >
    <div ref="content" :class="`${prefixCls}-content`"><slot /></div>
    <svg
      v-if="state === 'idle' && autoplay && !disabled && duration > 0"
      :class="`${prefixCls}-overlay`"
      data-reveal-initial
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100%" height="100%" />
    </svg>
    <svg
      v-if="shapes.length"
      ref="overlay"
      :class="`${prefixCls}-overlay`"
      :viewBox="`0 0 ${box.width} ${box.height}`"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask
          v-for="(shape, index) in shapes"
          :id="`${id}-${index}`"
          :key="index"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          :width="box.width"
          :height="box.height"
        >
          <rect
            :x="shape.x"
            :y="shape.y"
            :width="shape.width"
            :height="shape.height"
            :rx="shape.radius"
            fill="none"
            stroke="white"
            stroke-width="5"
            pathLength="1"
            stroke-dasharray="1"
            stroke-dashoffset="1"
            data-reveal-draw
          />
        </mask>
      </defs>
      <rect
        v-for="(shape, index) in shapes"
        :key="index"
        :x="shape.x"
        :y="shape.y"
        :width="shape.width"
        :height="shape.height"
        :rx="shape.radius"
        :mask="`url(#${id}-${index})`"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
  import type {
    SkeletonRevealBox,
    SkeletonRevealShape,
    SkeletonRevealState,
  } from '@sdata/web-core/skeleton-reveal/types';

  import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue';

  import { createSkeletonRevealFoundation } from '@sdata/web-core/skeleton-reveal/foundation';
  import { uniqueId } from 'es-toolkit/compat';
  import { animate, useReducedMotion } from 'motion-v';

  import type { SkeletonRevealExposed, SkeletonRevealProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'SkeletonReveal' });
  const { duration = 1600, autoplay = true, disabled = false } = defineProps<SkeletonRevealProps>();
  const emit = defineEmits<{ finish: [] }>();
  const prefixCls = getPrefixCls('skeleton-reveal');
  const id = uniqueId('sd-reveal-');
  const root = useTemplateRef('root');
  const content = useTemplateRef('content');
  const overlay = useTemplateRef('overlay');
  const reducedMotion = useReducedMotion();
  const state = shallowRef<SkeletonRevealState>('idle');
  const shapes = shallowRef<SkeletonRevealShape[]>([]);
  const box = shallowRef<SkeletonRevealBox>({ width: 1, height: 1 });
  const foundation = createSkeletonRevealFoundation({
    props: {
      get duration() {
        return duration;
      },
      get autoplay() {
        return autoplay;
      },
      get disabled() {
        return disabled;
      },
    },
    get root() {
      return root.value;
    },
    get content() {
      return content.value;
    },
    get overlay() {
      return overlay.value;
    },
    get reducedMotion() {
      return Boolean(reducedMotion.value);
    },
    get state() {
      return state.value;
    },
    set state(value) {
      state.value = value;
    },
    get shapes() {
      return shapes.value;
    },
    set shapes(value) {
      shapes.value = value;
    },
    get box() {
      return box.value;
    },
    set box(value) {
      box.value = value;
    },
    afterRender: () => nextTick(),
    animate: (element, values, options) => animate(element, values, options),
    onFinish: () => emit('finish'),
  });
  watch([() => disabled, reducedMotion], foundation.syncOptions);
  onMounted(foundation.connect);
  onBeforeUnmount(foundation.dispose);
  defineExpose<SkeletonRevealExposed>({ replay: foundation.replay, finish: foundation.finish });
</script>
