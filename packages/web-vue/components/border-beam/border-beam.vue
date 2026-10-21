<template>
  <div
    ref="wrapperRef"
    :data-beam="id"
    :data-active="isActive && !isFading ? '' : undefined"
    :data-fading="isFading ? '' : undefined"
    :data-flowing="isFlowing ? '' : undefined"
    :data-paused="isActive && !isFading && !isVisible ? '' : undefined"
    :class="cls"
    :style="mergedStyle"
    @animationend="handleAnimationEnd"
  >
    <slot />
    <div data-beam-bloom />
    <svg
      v-if="isFlowing"
      :key="flowKey"
      data-beam-flow
      :viewBox="`0 0 ${flowBox.width} ${flowBox.height}`"
      preserveAspectRatio="none"
      aria-hidden="true"
      @animationend.stop="handleFlowAnimationEnd"
    >
      <defs>
        <filter
          :id="`${id}-flow-warp`"
          x="-24%"
          y="-24%"
          width="148%"
          height="148%"
          color-interpolation-filters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.026"
            :seed="flowSeed"
            numOctaves="2"
            result="flow-noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flow-noise"
            :scale="flowDisplacement"
            xChannelSelector="R"
            yChannelSelector="G"
            result="flow-displaced"
          />
          <feGaussianBlur in="flow-displaced" stdDeviation="1.1" result="flow-soft" />
          <feColorMatrix in="flow-soft" type="saturate" values="1.24" />
        </filter>
        <radialGradient
          :id="`${id}-flow-fill`"
          gradientUnits="userSpaceOnUse"
          :cx="flowPoint.x"
          :cy="flowPoint.y"
          :r="flowRadius"
        >
          <stop offset="0" :stop-color="flowColors.core" stop-opacity="0.5" />
          <stop offset="0.18" :stop-color="flowColors.mist" stop-opacity="0.42" />
          <stop offset="0.46" :stop-color="flowColors.accent" stop-opacity="0.32" />
          <stop offset="0.76" :stop-color="flowColors.edge" stop-opacity="0.18" />
          <stop offset="1" :stop-color="flowColors.edge" stop-opacity="0" />
        </radialGradient>
        <mask
          :id="`${id}-flow-mask`"
          maskUnits="userSpaceOnUse"
          :x="-flowRadius"
          :y="-flowRadius"
          :width="flowBox.width + flowRadius * 2"
          :height="flowBox.height + flowRadius * 2"
        >
          <g :filter="`url(#${id}-flow-warp)`">
            <circle data-beam-flow-blob :cx="flowPoint.x" :cy="flowPoint.y" :r="flowRadius" />
            <circle
              data-beam-flow-blob="shore-a"
              :cx="flowPoint.x"
              :cy="flowPoint.y"
              :r="flowRadius * 0.72"
            />
            <circle
              data-beam-flow-blob="shore-b"
              :cx="flowPoint.x"
              :cy="flowPoint.y"
              :r="flowRadius * 0.56"
            />
          </g>
        </mask>
      </defs>
      <rect
        data-beam-flow-sheet
        x="0"
        y="0"
        :width="flowBox.width"
        :height="flowBox.height"
        :rx="finalBorderRadius"
        :fill="`url(#${id}-flow-fill)`"
        :mask="`url(#${id}-flow-mask)`"
      />
      <g :filter="`url(#${id}-flow-warp)`">
        <circle
          data-beam-flow-front
          :cx="flowPoint.x"
          :cy="flowPoint.y"
          :r="flowRadius"
          fill="none"
          :stroke="flowColors.front"
          :stroke-width="Math.max(18, flowRadius * 0.1)"
        />
        <circle
          data-beam-flow-front="highlight"
          :cx="flowPoint.x"
          :cy="flowPoint.y"
          :r="flowRadius * 0.94"
          fill="none"
          :stroke="flowColors.specular"
          :stroke-width="Math.max(8, flowRadius * 0.035)"
        />
      </g>
      <circle
        data-beam-flow-specular
        :cx="flowPoint.x"
        :cy="flowPoint.y"
        :r="Math.max(16, flowRadius * 0.18)"
        :fill="flowColors.specular"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';

  import { createBorderBeamFoundation } from '@sdata/web-core/border-beam/foundation';

  import type {
    BorderBeamTheme,
    BorderBeamSize,
    BorderBeamColorVariant,
    BorderBeamFlowCoordinate,
    BorderBeamFlowPoint,
    BorderBeamExposed,
  } from './types';

  import { useBeamPreferences } from '../_hooks/use-beam-preferences';
  import { getPrefixCls } from '../_utils/global-config';
  import { nextInstanceId } from './instance-id';

  defineOptions({ name: 'BorderBeam' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 尺寸/类型预设
       * @en Size/type preset
       * @default 'md'
       */
      size?: BorderBeamSize;
      /**
       * @zh 颜色变体
       * @en Color variant
       * @default 'colorful'
       */
      colorVariant?: BorderBeamColorVariant;
      /**
       * @zh 主题模式
       * @en Theme mode
       * @default 'dark'
       */
      theme?: BorderBeamTheme;
      /**
       * @zh 禁用色相偏移动画
       * @en Disable hue-shift animation
       * @default false
       */
      staticColors?: boolean;
      /**
       * @zh 旋转/移动持续时间（秒）Rotation/travel
       * @en duration in seconds
       */
      duration?: number;
      /**
       * @zh 动画是否激活
       * @en Whether the animation is active
       * @default true
       */
      active?: boolean;
      /**
       * @zh 自定义边框圆角（像素），省略时自动检测
       * @en Custom border radius in pixels
       */
      borderRadius?: number;
      /**
       * @zh 亮度倍率，默认使用预设值
       * @en Brightness multiplier
       */
      brightness?: number;
      /**
       * @zh 饱和度倍率，默认使用预设值
       * @en Saturation multiplier
       */
      saturation?: number;
      /**
       * @zh 色相旋转范围（度）
       * @en Hue rotation range in degrees
       * @default 30
       */
      hueRange?: number;
      /**
       * @zh 整体效果强度
       * @en 0–1 Overall strength/opacity
       * @default 1
       */
      strength?: number;
      /**
       * @zh 渐变尺寸倍率
       * @en Gradient size multiplier
       * @default 1
       */
      density?: number;
    }>(),
    {
      size: 'md',
      colorVariant: 'colorful',
      theme: 'dark',
      staticColors: false,
      active: true,
      hueRange: 30,
      strength: 1,
      density: 1,
    },
  );

  const emit = defineEmits<{
    /**
     * @zh 淡入动画完成时触发
     * @en Fired when fade-in animation completes
     */
    activate: [];
    /**
     * @zh 淡出动画完成时触发
     * @en Fired when fade-out animation completes
     */
    deactivate: [];
  }>();

  // ── Unique instance ID ──────────────────────────────────────────────────────
  const id = `bb-${nextInstanceId()}`;

  // ── CSS prefix ──────────────────────────────────────────────────────────────
  const prefixCls = getPrefixCls('border-beam');

  const cls = computed(() => [prefixCls]);

  // ── System theme detection ──────────────────────────────────────────────────
  const { systemTheme, reducedMotion } = useBeamPreferences();

  // ── DOM ref ─────────────────────────────────────────────────────────────────
  const wrapperRef = ref<HTMLDivElement | null>(null);

  // ── Internal state ──────────────────────────────────────────────────────────
  const isActive = ref(false);
  const isFading = ref(false);
  const isVisible = ref(true);
  const detectedRadius = ref<number | null>(null);
  const pulseGlowScale = ref({ x: 1, y: 1 });
  const isFlowing = shallowRef(false);
  const flowKey = shallowRef(0);
  const flowPoint = shallowRef<BorderBeamFlowPoint>({ x: 0, y: 0 });
  const flowRadius = shallowRef(0);
  const flowBox = shallowRef({ width: 1, height: 1 });
  const flowSeed = shallowRef(1);
  const foundation = createBorderBeamFoundation(
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
      get isVisible() {
        return isVisible.value;
      },
      set isVisible(value) {
        isVisible.value = value;
      },
      get detectedRadius() {
        return detectedRadius.value;
      },
      set detectedRadius(value) {
        detectedRadius.value = value;
      },
      get pulseGlowScale() {
        return pulseGlowScale.value;
      },
      set pulseGlowScale(value) {
        pulseGlowScale.value = value;
      },
      get isFlowing() {
        return isFlowing.value;
      },
      set isFlowing(value) {
        isFlowing.value = value;
      },
      get flowKey() {
        return flowKey.value;
      },
      set flowKey(value) {
        flowKey.value = value;
      },
      get flowPoint() {
        return flowPoint.value;
      },
      set flowPoint(value) {
        flowPoint.value = value;
      },
      get flowRadius() {
        return flowRadius.value;
      },
      set flowRadius(value) {
        flowRadius.value = value;
      },
      get flowBox() {
        return flowBox.value;
      },
      set flowBox(value) {
        flowBox.value = value;
      },
      get flowSeed() {
        return flowSeed.value;
      },
      set flowSeed(value) {
        flowSeed.value = value;
      },
      get systemTheme() {
        return systemTheme.value;
      },
      get resolvedTheme() {
        return resolvedTheme.value;
      },
      get themeConfig() {
        return themeConfig.value;
      },
      get sizeConfig() {
        return sizeConfig.value;
      },
      get isPulse() {
        return isPulse.value;
      },
      get finalBorderRadius() {
        return finalBorderRadius.value;
      },
      get finalDuration() {
        return finalDuration.value;
      },
      get finalSaturation() {
        return finalSaturation.value;
      },
      get finalBrightness() {
        return finalBrightness.value;
      },
      get finalHueRange() {
        return finalHueRange.value;
      },
      get finalStaticColors() {
        return finalStaticColors.value;
      },
      get cssStyles() {
        return cssStyles.value;
      },
      get driverConfig() {
        return driverConfig.value;
      },
    },
    {
      afterRender: (task) => {
        void nextTick(task);
      },
      activate: () => emit('activate'),
      deactivate: () => emit('deactivate'),
    },
  );
  const { flowFrom, handleFlowAnimationEnd, handleAnimationEnd } = foundation;
  const flowDisplacement = computed(foundation.getFlowDisplacement);
  const flowColors = computed(foundation.getFlowColors);
  defineExpose<BorderBeamExposed>({
    flowFrom,
  });
  onMounted(foundation.mountRadius);
  onMounted(foundation.mountIntersection);
  onUnmounted(foundation.disposeFlow);
  watch(() => props.active, foundation.syncActive);
  onUnmounted(foundation.disposeIntersection);
  watch(() => props.size, foundation.syncSize);
  onMounted(foundation.mountScale);
  onUnmounted(foundation.disposeScale);
  const resolvedTheme = computed(foundation.getResolvedTheme);
  const themeConfig = computed(foundation.getThemeConfig);
  const sizeConfig = computed(foundation.getSizeConfig);
  const isPulse = computed(foundation.getIsPulse);
  const finalBorderRadius = computed(foundation.getFinalBorderRadius);
  const finalDuration = computed(foundation.getFinalDuration);
  const finalSaturation = computed(foundation.getFinalSaturation);
  const finalBrightness = computed(foundation.getFinalBrightness);
  const finalHueRange = computed(foundation.getFinalHueRange);
  const finalStaticColors = computed(foundation.getFinalStaticColors);
  const cssStyles = computed(foundation.getCssStyles);
  onMounted(foundation.mountStyle);
  watch(cssStyles, foundation.syncCss);
  onUnmounted(foundation.disposeStyle);
  const driverConfig = computed(foundation.getDriverConfig);
  onMounted(foundation.mountPulse);
  watch([driverConfig, isActive, isFading, isVisible, reducedMotion], foundation.syncPulse);
  watch(reducedMotion, foundation.syncReducedMotion);
  onUnmounted(foundation.disposePulse);
  const mergedStyle = computed(foundation.getMergedStyle);
</script>
