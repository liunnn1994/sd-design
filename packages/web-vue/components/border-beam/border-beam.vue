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

<script lang="ts">
  // Module-scoped counter so every instance on a page gets a unique id.
  // Must live in a plain <script> block — inside <script setup> it would reset
  // per instance, causing CSS selector collisions when multiple beams coexist.
  let instanceCounter = 0;
</script>

<script lang="ts" setup>
  import { ref, computed, watch, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';

  import type {
    BorderBeamTheme,
    BorderBeamSize,
    BorderBeamColorVariant,
    BorderBeamFlowCoordinate,
    BorderBeamFlowPoint,
    BorderBeamExposed,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { registerPulseInstance } from './pulseDriver';
  import { sizePresets, sizeThemePresets, generateBeamCSS, getPulseDriverConfig } from './styles';

  defineOptions({ name: 'BorderBeam' });

  const props = withDefaults(
    defineProps<{
      /** 尺寸/类型预设 Size/type preset @default 'md' @zh 尺寸/类型预设 */
      size?: BorderBeamSize;
      /** 颜色变体 Color variant @default 'colorful' @zh 颜色变体 */
      colorVariant?: BorderBeamColorVariant;
      /** 主题模式 Theme mode @default 'dark' @zh 主题模式 */
      theme?: BorderBeamTheme;
      /** 禁用色相偏移动画 Disable hue-shift animation @default false @zh 禁用色相偏移动画 */
      staticColors?: boolean;
      /** 旋转/移动持续时间（秒）Rotation/travel duration in seconds @zh 旋转/移动持续时间（秒） */
      duration?: number;
      /** 动画是否激活 Whether the animation is active @default true @zh 动画是否激活 */
      active?: boolean;
      /** 自定义边框圆角（像素），省略时自动检测 Custom border radius in pixels @zh 自定义边框圆角（像素） */
      borderRadius?: number;
      /** 亮度倍率，默认使用预设值 Brightness multiplier @zh 亮度倍率 */
      brightness?: number;
      /** 饱和度倍率，默认使用预设值 Saturation multiplier @zh 饱和度倍率 */
      saturation?: number;
      /** 色相旋转范围（度） Hue rotation range in degrees @default 30 @zh 色相旋转范围（度） */
      hueRange?: number;
      /** 整体效果强度 0–1 Overall strength/opacity @default 1 @zh 整体效果强度 */
      strength?: number;
      /** 渐变尺寸倍率 Gradient size multiplier @default 1 @zh 渐变尺寸倍率 */
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
    /** 淡入动画完成时触发 Fired when fade-in animation completes @zh 淡入动画完成时触发 */
    activate: [];
    /** 淡出动画完成时触发 Fired when fade-out animation completes @zh 淡出动画完成时触发 */
    deactivate: [];
  }>();

  // ── Unique instance ID ──────────────────────────────────────────────────────
  const id = `bb-${++instanceCounter}`;

  // ── CSS prefix ──────────────────────────────────────────────────────────────
  const prefixCls = getPrefixCls('border-beam');

  const cls = computed(() => [prefixCls]);

  // ── System theme detection ──────────────────────────────────────────────────
  const systemTheme = ref<'dark' | 'light'>('dark');

  function updateSystemTheme() {
    if (typeof window === 'undefined') return;
    systemTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  let mediaQueryCleanup: (() => void) | null = null;

  onMounted(() => {
    updateSystemTheme();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      systemTheme.value = e.matches ? 'dark' : 'light';
    };
    mq.addEventListener('change', handler);
    mediaQueryCleanup = () => mq.removeEventListener('change', handler);
  });

  onUnmounted(() => {
    mediaQueryCleanup?.();
  });

  function resolveTheme(theme: BorderBeamTheme, sysTheme: 'dark' | 'light'): 'dark' | 'light' {
    return theme === 'auto' ? sysTheme : theme;
  }

  // ── DOM ref ─────────────────────────────────────────────────────────────────
  const wrapperRef = ref<HTMLDivElement | null>(null);

  // ── Internal state ──────────────────────────────────────────────────────────
  const isActive = ref(props.active);
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
  let flowTimer: number | null = null;

  // ── Flow entrance state ──────────────────────────────────────────────────────
  function clearFlowTimer() {
    if (!flowTimer) return;
    window.clearTimeout(flowTimer);
    flowTimer = null;
  }

  function finishFlow() {
    clearFlowTimer();
    isFlowing.value = false;
  }

  function resolveFlowPoint(
    coordinate: BorderBeamFlowCoordinate | undefined,
    rect: DOMRect,
  ): BorderBeamFlowPoint {
    const value = coordinate ?? 'top-right';

    if (typeof value !== 'string') {
      return { x: value.x, y: value.y };
    }

    switch (value) {
      case 'top-left':
        return { x: 0, y: 0 };
      case 'bottom-left':
        return { x: 0, y: rect.height };
      case 'bottom-right':
        return { x: rect.width, y: rect.height };
      case 'center':
        return { x: rect.width / 2, y: rect.height / 2 };
      case 'top-right':
      default:
        return { x: rect.width, y: 0 };
    }
  }

  function getFlowRadius(point: BorderBeamFlowPoint, rect: DOMRect): number {
    return (
      Math.max(
        Math.hypot(point.x, point.y),
        Math.hypot(rect.width - point.x, point.y),
        Math.hypot(point.x, rect.height - point.y),
        Math.hypot(rect.width - point.x, rect.height - point.y),
      ) + 48
    );
  }

  function getFlowSeed(point: BorderBeamFlowPoint): number {
    return Math.max(1, Math.round((point.x * 3 + point.y * 5 + flowKey.value * 17) % 997));
  }

  const flowDisplacement = computed(() => Math.max(8, Math.min(24, flowRadius.value * 0.07)));
  const flowColors = computed(() => {
    const isDark = resolvedTheme.value === 'dark';
    const variants = {
      colorful: isDark
        ? { accent: '#65d8ff', edge: '#b060ff' }
        : { accent: '#2785ff', edge: '#8d50d8' },
      mono: isDark
        ? { accent: '#f4f4f0', edge: '#b7bbb8' }
        : { accent: '#4b5250', edge: '#8a908d' },
      ocean: isDark
        ? { accent: '#68c8ff', edge: '#7a77ff' }
        : { accent: '#2c76d8', edge: '#6356c8' },
      sunset: isDark
        ? { accent: '#ffb25f', edge: '#ff646f' }
        : { accent: '#dd6b22', edge: '#c84450' },
    }[props.colorVariant];

    return {
      core: isDark ? '#f8fdff' : '#ffffff',
      mist: isDark ? '#b9f2ff' : '#e9fbff',
      specular: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.38)',
      front: variants.accent,
      ...variants,
    };
  });

  function shouldReduceMotion() {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
  }

  function flowFrom(coordinate?: BorderBeamFlowCoordinate) {
    const el = wrapperRef.value;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const point = resolveFlowPoint(coordinate, rect);

    flowKey.value += 1;
    flowBox.value = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
    flowPoint.value = point;
    flowRadius.value = getFlowRadius(point, rect);
    flowSeed.value = getFlowSeed(point);
    isActive.value = true;
    isFading.value = false;

    if (shouldReduceMotion()) {
      finishFlow();
      return;
    }

    clearFlowTimer();
    isFlowing.value = true;
    flowTimer = window.setTimeout(finishFlow, 760);
  }

  function handleFlowAnimationEnd() {
    finishFlow();
  }

  defineExpose<BorderBeamExposed>({
    flowFrom,
  });

  let mutationObserver: MutationObserver | null = null;

  onMounted(() => {
    const detect = () => {
      if (props.borderRadius != null) return;
      const el = wrapperRef.value;
      if (!el) return;
      const child = el.firstElementChild as HTMLElement | null;
      if (!child) return;
      const computed = getComputedStyle(child);
      const raw = parseFloat(computed.borderTopLeftRadius);
      if (!isNaN(raw) && raw > 0) {
        detectedRadius.value = raw;
      }
    };

    nextTick(() => {
      detect();
      const el = wrapperRef.value;
      if (!el) return;
      mutationObserver = new MutationObserver(detect);
      mutationObserver.observe(el, { childList: true, subtree: false });
    });
  });

  onUnmounted(() => {
    clearFlowTimer();
    mutationObserver?.disconnect();
  });

  // ── Active / fading state management ────────────────────────────────────────
  watch(
    () => props.active,
    (active) => {
      if (active && !isActive.value && !isFading.value) {
        isActive.value = true;
      } else if (!active && isActive.value && !isFading.value) {
        isFading.value = true;
      }
    },
  );

  // ── IntersectionObserver for offscreen pausing ──────────────────────────────
  let intersectionCleanup: (() => void) | null = null;

  onMounted(() => {
    const el = wrapperRef.value;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) isVisible.value = entry.isIntersecting;
      },
      { rootMargin: '256px' },
    );

    observer.observe(el);
    intersectionCleanup = () => observer.disconnect();
  });

  onUnmounted(() => {
    intersectionCleanup?.();
  });

  // ── Pulse-outside glow geometry ─────────────────────────────────────────────
  let resizeObserverCleanup: (() => void) | null = null;

  function setupPulseGlowScale() {
    resizeObserverCleanup?.();
    resizeObserverCleanup = null;

    if (props.size !== 'pulse-outside') {
      pulseGlowScale.value = { x: 1, y: 1 };
      return;
    }

    const el = wrapperRef.value;
    if (!el) return;

    const REF_WIDTH = 350;
    const REF_HEIGHT = 140;
    const MIN_SCALE = 0.35;
    const MAX_SCALE = 4;
    const clamp = (value: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));

    const measure = () => {
      const child = el.firstElementChild as HTMLElement | null;
      if (!child) return;
      const rect = child.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = +clamp(rect.width / REF_WIDTH).toFixed(3);
      const y = +clamp(rect.height / REF_HEIGHT).toFixed(3);
      if (pulseGlowScale.value.x !== x || pulseGlowScale.value.y !== y) {
        pulseGlowScale.value = { x, y };
      }
    };

    nextTick(() => {
      measure();
      if (typeof ResizeObserver === 'undefined') return;
      const child = el.firstElementChild as HTMLElement | null;
      if (!child) return;
      const ro = new ResizeObserver(measure);
      ro.observe(child);
      resizeObserverCleanup = () => ro.disconnect();
    });
  }

  watch(
    () => props.size,
    () => setupPulseGlowScale(),
  );
  onMounted(() => setupPulseGlowScale());
  onUnmounted(() => resizeObserverCleanup?.());

  // ── Animation end handler ───────────────────────────────────────────────────
  function handleAnimationEnd(e: AnimationEvent) {
    const animationName = (e as AnimationEvent).animationName || '';
    if (animationName.includes('fade-out')) {
      isActive.value = false;
      isFading.value = false;
      emit('deactivate');
    } else if (animationName.includes('fade-in')) {
      emit('activate');
    }
  }

  // ── Computed derived values ─────────────────────────────────────────────────
  const resolvedTheme = computed(() => resolveTheme(props.theme, systemTheme.value));
  const themeConfig = computed(() => sizeThemePresets[props.size][resolvedTheme.value]);
  const sizeConfig = computed(() => sizePresets[props.size]);
  const isPulse = computed(() => props.size === 'pulse-inner' || props.size === 'pulse-outside');

  const finalBorderRadius = computed(
    () => props.borderRadius ?? detectedRadius.value ?? sizeConfig.value.borderRadius,
  );

  function getDefaultDuration(size: BorderBeamSize, isPulse: boolean): number {
    if (size === 'line') return 3.1;
    if (isPulse) return 2.3;
    return 1.96;
  }

  const finalDuration = computed(
    () => props.duration ?? getDefaultDuration(props.size, isPulse.value),
  );
  const finalSaturation = computed(() => props.saturation ?? themeConfig.value.saturation);
  const finalBrightness = computed(() => props.brightness ?? themeConfig.value.brightness ?? 1.3);
  const finalHueRange = computed(() =>
    props.size === 'line' ? Math.min(props.hueRange, 13) : props.hueRange,
  );
  const finalStaticColors = computed(() =>
    props.colorVariant === 'mono' ? true : props.staticColors,
  );

  // ── Generate CSS ────────────────────────────────────────────────────────────
  const cssStyles = computed(() =>
    generateBeamCSS({
      id,
      borderRadius: finalBorderRadius.value,
      borderWidth: sizeConfig.value.borderWidth,
      duration: finalDuration.value,
      strokeOpacity: themeConfig.value.strokeOpacity,
      innerOpacity: themeConfig.value.innerOpacity,
      bloomOpacity: themeConfig.value.bloomOpacity,
      innerShadow: themeConfig.value.innerShadow,
      size: props.size,
      colorVariant: props.colorVariant,
      staticColors: finalStaticColors.value,
      brightness: finalBrightness.value,
      saturation: finalSaturation.value,
      hueRange: finalHueRange.value,
      theme: resolvedTheme.value,
      hairlineOpacity: themeConfig.value.hairlineOpacity,
    }),
  );

  // ── Inject CSS into document head ───────────────────────────────────────────
  let styleEl: HTMLStyleElement | null = null;

  function ensureStyleEl(): HTMLStyleElement {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-beam-style', id);
      document.head.appendChild(styleEl);
    }
    return styleEl;
  }

  onMounted(() => {
    ensureStyleEl().textContent = cssStyles.value;
  });

  watch(cssStyles, (css) => {
    ensureStyleEl().textContent = css;
  });

  onUnmounted(() => {
    styleEl?.remove();
    styleEl = null;
  });

  // ── Pulse driver ────────────────────────────────────────────────────────────
  const driverConfig = computed(() =>
    isPulse.value
      ? getPulseDriverConfig(
          props.size,
          resolvedTheme.value,
          finalDuration.value,
          finalHueRange.value,
          finalStaticColors.value,
          id,
        )
      : null,
  );

  let unregisterPulse: (() => void) | null = null;

  function syncPulseDriver() {
    if (unregisterPulse) {
      unregisterPulse();
      unregisterPulse = null;
    }

    if (!driverConfig.value) return;
    if (!(isActive.value || isFading.value) || !isVisible.value) return;

    const el = wrapperRef.value;
    if (!el) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    unregisterPulse = registerPulseInstance(el, driverConfig.value);
  }

  onMounted(() => syncPulseDriver());
  watch([driverConfig, isActive, isFading, isVisible], () => syncPulseDriver());

  onUnmounted(() => {
    if (unregisterPulse) {
      unregisterPulse();
      unregisterPulse = null;
    }
  });

  // ── Merged inline style (CSS custom properties) ─────────────────────────────
  const mergedStyle = computed(() => ({
    '--beam-strength': Math.max(0, Math.min(1, props.strength)),
    '--beam-density': Math.max(0.1, props.density),
    '--beam-flow-x': `${flowPoint.value.x}px`,
    '--beam-flow-y': `${flowPoint.value.y}px`,
    '--beam-flow-radius': `${flowRadius.value}px`,
    ...(props.size === 'pulse-outside'
      ? { '--pulse-glow-sx': pulseGlowScale.value.x, '--pulse-glow-sy': pulseGlowScale.value.y }
      : {}),
  }));
</script>
