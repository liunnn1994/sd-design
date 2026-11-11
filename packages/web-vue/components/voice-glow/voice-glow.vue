<template>
  <div
    ref="wrapperRef"
    v-bind="$attrs"
    :class="[prefixCls, className]"
    :data-voice-beam="id"
    :data-voice-type="type"
    data-voice-halfres=""
    :data-active="isActive && !isFading ? '' : undefined"
    :data-fading="isFading ? '' : undefined"
    :data-paused="paused ? '' : undefined"
    :data-listening="stream ? '' : undefined"
    :data-processing="processing ? '' : undefined"
    :style="[
      props.style,
      { '--voice-strength': strength ?? typeStyle.strength ?? palette.strength ?? 1 },
    ]"
    @animationend="handleAnimationEnd"
  >
    <slot />
    <div data-voice-beam-bloom />
    <div v-if="distortion > 0" data-voice-beam-warp="inner" />
    <div v-if="distortion > 0" data-voice-beam-warp="bloom" />
    <canvas v-if="!canvasFilter" data-voice-beam-band-halo aria-hidden="true" />
    <canvas data-voice-beam-band aria-hidden="true" />
    <div v-if="coreLight > 0" data-voice-beam-core><div /></div>
    <svg v-if="distortion > 0" aria-hidden="true" width="0" height="0" class="sd-voice-glow-filter">
      <filter
        :id="`vb-distort-${id}`"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        color-interpolation-filters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          :baseFrequency="`${(0.012 * distortionDetail).toFixed(4)} ${(0.05 * distortionDetail).toFixed(4)}`"
          numOctaves="2"
          seed="7"
          result="noise"
        />
        <feOffset in="noise" dx="0" dy="0" result="moved" />
        <feColorMatrix
          in="moved"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1"
          result="map"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, shallowRef, watch, watchEffect } from 'vue';

  import {
    createVoiceGlowFoundation,
    supportsVoiceCanvasFilter,
    voiceGlowPropDefaults,
  } from '@sdata/web-core/voice-glow/foundation';

  import type { VoiceGlowProps } from './types';

  import { useBeamPreferences } from '../_hooks/use-beam-preferences';
  import { getPrefixCls } from '../_utils/global-config';
  import { nextInstanceId } from './instance-id';

  defineOptions({ name: 'VoiceGlow', inheritAttrs: false });

  const props = withDefaults(defineProps<VoiceGlowProps>(), voiceGlowPropDefaults);
  const emit = defineEmits<{
    /**
     * @zh 当前平滑音量
     * @en Current smoothed level
     */
    level: [value: number];
    /**
     * @zh 淡入结束
     * @en Fade-in completed
     */
    activate: [];
    /**
     * @zh 淡出结束
     * @en Fade-out completed
     */
    deactivate: [];
  }>();
  defineSlots<{ default?: () => unknown }>();

  const prefixCls = getPrefixCls('voice-glow');
  const id = `vg-${nextInstanceId()}`;
  const wrapperRef = shallowRef<HTMLElement>();
  const isActive = shallowRef(false);
  const isFading = shallowRef(false);
  const { systemTheme, reducedMotion } = useBeamPreferences();
  const detectedRadius = shallowRef(16);
  const canvasFilter = supportsVoiceCanvasFilter();
  const foundation = createVoiceGlowFoundation(
    {
      id,
      props,
      get wrapper() {
        return wrapperRef.value;
      },
      get isActive() {
        return isActive.value;
      },
      set isActive(value) {
        isActive.value = value;
      },
      get isFading() {
        return isFading.value;
      },
      set isFading(value) {
        isFading.value = value;
      },
      get detectedRadius() {
        return detectedRadius.value;
      },
      set detectedRadius(value) {
        detectedRadius.value = value;
      },
      get systemTheme() {
        return systemTheme.value;
      },
      get reducedMotion() {
        return reducedMotion.value;
      },
    },
    {
      level: (value) => emit('level', value),
      activate: () => emit('activate'),
      deactivate: () => emit('deactivate'),
    },
  );
  const palette = computed(foundation.getPalette);
  const typeStyle = computed(foundation.getTypeStyle);
  const coreLight = computed(foundation.getCoreLight);
  const distortion = computed(foundation.getDistortion);
  const distortionDetail = computed(foundation.getDistortionDetail);
  const css = computed(foundation.getCss);
  watch(() => props.active, foundation.syncActive);
  const { handleAnimationEnd } = foundation;
  onMounted(foundation.mountRadius);
  watchEffect(foundation.connectDriver, { flush: 'post' });
  watch(css, foundation.syncCss);
  onMounted(foundation.mountStyle);
  onBeforeUnmount(foundation.disposeStyle);
</script>
