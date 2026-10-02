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

  import type { VoiceGlowProps } from './types';

  import { useBeamPreferences } from '../_hooks/use-beam-preferences';
  import { getPrefixCls } from '../_utils/global-config';
  import { toTriple } from './color';
  import { nextInstanceId } from './instance-id';
  import { resolveVoiceDefaults, resolveVoiceStyle } from './presets';
  import { generateVoiceBeamCSS, themePresets } from './styles';
  import { registerVoiceInstance, type VoiceDriverConfig } from './voiceDriver';

  defineOptions({ name: 'VoiceGlow', inheritAttrs: false });

  const props = withDefaults(defineProps<VoiceGlowProps>(), {
    type: 'default',
    theme: 'auto',
    colorVariant: 'colorful',
    level: 0,
    sensitivity: 3.1,
    threshold: 0.015,
    attack: 0.325,
    release: 0.86,
    breatheDuration: 5.2,
    bands: true,
    processing: false,
    processingEase: 0.6,
    active: true,
    paused: false,
    staticColors: false,
  });
  const emit = defineEmits<{
    /** @zh 当前平滑音量 @en Current smoothed level */
    level: [value: number];
    /** @zh 淡入结束 @en Fade-in completed */
    activate: [];
    /** @zh 淡出结束 @en Fade-out completed */
    deactivate: [];
  }>();
  defineSlots<{ default?: () => unknown }>();

  const prefixCls = getPrefixCls('voice-glow');
  const id = `vg-${nextInstanceId()}`;
  const wrapperRef = shallowRef<HTMLElement>();
  const isActive = shallowRef(props.active);
  const isFading = shallowRef(false);
  const { systemTheme, reducedMotion } = useBeamPreferences();
  const detectedRadius = shallowRef(16);
  const canvasFilter =
    typeof document === 'undefined' ||
    typeof document.createElement('canvas').getContext('2d')?.filter === 'string';
  const resolvedTheme = computed(() => (props.theme === 'auto' ? systemTheme.value : props.theme));
  const defaults = computed(() => resolveVoiceDefaults(props.type, resolvedTheme.value));
  const palette = computed(() => themePresets[resolvedTheme.value]);
  const typeStyle = computed(() => resolveVoiceStyle(props.type, resolvedTheme.value));
  const scale = computed(() => Math.max(0.05, props.scale ?? defaults.value.scale));
  const geometry = computed(() => {
    const result = { ...defaults.value };
    for (const key of Object.keys(result) as (keyof typeof result)[]) {
      const override = props[key];
      if (typeof override === 'number') result[key] = override;
    }
    return result;
  });
  const coreLight = computed(() => Math.max(0, Math.min(3, geometry.value.coreLight)));
  const distortion = computed(() => geometry.value.distortion);
  const distortionDetail = computed(() => geometry.value.distortionDetail / scale.value);
  const radius = computed(() => props.borderRadius ?? detectedRadius.value);
  const bandColors = computed(() => {
    const defaults =
      resolvedTheme.value === 'dark'
        ? {
            core: '255, 255, 255',
            above: '255, 70, 80',
            mid: '90, 255, 150',
            below: '80, 140, 255',
          }
        : {
            core: '197, 139, 255',
            above: '255, 122, 182',
            mid: '126, 196, 255',
            below: '45, 255, 171',
          };
    return {
      core: toTriple(props.bandColors?.core ?? '') ?? defaults.core,
      above: toTriple(props.bandColors?.above ?? '') ?? defaults.above,
      mid: toTriple(props.bandColors?.mid ?? '') ?? defaults.mid,
      below: toTriple(props.bandColors?.below ?? '') ?? defaults.below,
    };
  });
  const css = computed(() => {
    const g = geometry.value;
    return (
      generateVoiceBeamCSS({
        id,
        borderRadius: radius.value,
        borderWidth: 1,
        strokeOpacity: palette.value.strokeOpacity * g.strokeOpacity,
        innerOpacity: palette.value.innerOpacity * g.innerOpacity,
        bloomOpacity: palette.value.bloomOpacity * g.bloomOpacity,
        innerShadow: palette.value.innerShadow,
        colorVariant: props.colorVariant,
        colors: props.colors,
        brightness: props.brightness ?? typeStyle.value.brightness ?? palette.value.brightness,
        saturation: props.saturation ?? typeStyle.value.saturation ?? palette.value.saturation,
        theme: resolvedTheme.value,
        hueBase: palette.value.hueBase,
        glowSize: g.glowSize * scale.value,
        glowWidth: g.glowWidth * scale.value,
        glowHeight: g.glowHeight * scale.value,
        strokeScale: g.strokeScale,
        innerScale: g.innerScale,
        innerHeight: g.innerHeight,
        bloomScale: g.bloomScale,
        bloomHeight: g.bloomHeight,
        coreSize: g.coreSize * scale.value,
        coreLight: coreLight.value,
        coreLightWidth: g.coreLightWidth,
        coreLightHeight: g.coreLightHeight,
        rangeWidth: g.rangeWidth * scale.value,
        rangeHeight: g.rangeHeight * scale.value,
        softness: g.softness,
        distortion: distortion.value > 0,
        scale: scale.value,
      }) + (props.css ? `\n${props.css.replaceAll('{id}', id)}` : '')
    );
  });
  const driverConfig = computed<VoiceDriverConfig>(() => {
    const g = geometry.value;
    const sc = scale.value;
    return {
      id,
      sensitivity: props.sensitivity,
      threshold: props.threshold,
      attack: props.attack,
      release: props.release,
      idle: g.idle,
      breatheDuration: props.breatheDuration,
      reach: g.reach,
      spread: g.spread,
      bands: props.bands,
      flow: g.flow * sc,
      lobeSpacing: g.lobeSpacing * sc,
      bend: g.bend * sc,
      bandStrength: g.bandStrength,
      bandWidth: g.bandWidth * sc,
      bandPosition: g.bandPosition,
      bandCurve: g.bandCurve,
      bandSpread: g.bandSpread,
      bandSkew: g.bandSkew,
      bandOffset: g.bandOffset * sc,
      bandTail: g.bandTail,
      bandTailPosition: g.bandTailPosition,
      bandTailCurve: g.bandTailCurve,
      bandTailOverflow: g.bandTailOverflow * sc,
      bandAberration: g.bandAberration,
      rangeWidth: g.rangeWidth * sc,
      rangeHeight: g.rangeHeight * sc,
      theme: resolvedTheme.value,
      bandColors: bandColors.value,
      distortion: distortion.value,
      coreLight: coreLight.value,
      scale: sc,
      radius: radius.value,
      processing: props.processing,
      processingDuration: g.processingDuration,
      processingLevel: g.processingLevel,
      processingEase: props.processingEase,
      processingTravel: g.processingTravel,
      processingCurve: g.processingCurve,
      cornerFollow: g.cornerFollow,
      hueRange: props.hueRange ?? palette.value.hueRange ?? 24,
      hueDuration: props.hueDuration ?? palette.value.hueDuration ?? 12,
      staticColors: props.colorVariant === 'mono' || props.staticColors,
      reducedMotion: reducedMotion.value,
      paused: props.paused,
    };
  });

  watch(
    () => props.active,
    (active) => {
      if (active) {
        isActive.value = true;
        isFading.value = false;
      } else if (isActive.value) {
        isFading.value = true;
      }
    },
  );
  const handleAnimationEnd = (event: AnimationEvent) => {
    if (event.target !== wrapperRef.value || event.pseudoElement) return;
    if (event.animationName === `vb-fade-in-${id}`) {
      emit('activate');
      props.onActivate?.();
    }
    if (event.animationName === `vb-fade-out-${id}`) {
      isActive.value = false;
      isFading.value = false;
      emit('deactivate');
      props.onDeactivate?.();
    }
  };

  onMounted(() => {
    const host = wrapperRef.value;
    if (!host) return;
    const child = host.firstElementChild;
    const radiusSource = child?.hasAttribute('data-voice-beam-bloom') ? host.parentElement : child;
    if (radiusSource) {
      detectedRadius.value = parseFloat(getComputedStyle(radiusSource).borderTopLeftRadius) || 16;
    }
  });

  watchEffect((onCleanup) => {
    if (!wrapperRef.value || !(isActive.value || isFading.value)) return;
    const cleanup = registerVoiceInstance(
      wrapperRef.value,
      driverConfig.value,
      {
        stream: props.stream,
        getLevel: () => (typeof props.level === 'function' ? props.level() : props.level),
      },
      (level) => {
        emit('level', level);
        props.onLevel?.(level);
      },
    );
    onCleanup(cleanup);
  });
  let styleElement: HTMLStyleElement | undefined;
  watch(css, (value) => {
    if (styleElement) styleElement.textContent = value;
  });
  onMounted(() => {
    styleElement = document.createElement('style');
    styleElement.textContent = css.value;
    wrapperRef.value?.before(styleElement);
  });
  onBeforeUnmount(() => styleElement?.remove());
</script>
