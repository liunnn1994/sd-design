import type {
  BorderBeamTheme,
  BorderBeamSize,
  BorderBeamColorVariant,
  BorderBeamFlowCoordinate,
  BorderBeamFlowPoint,
  ThemeColors,
  SizeConfig,
} from './types.js';

import { registerPulseInstance } from './pulseDriver.js';
import {
  sizePresets,
  sizeThemePresets,
  generateBeamCSS,
  getPulseDriverConfig,
  type PulseDriverConfig,
} from './styles.js';
export interface BorderBeamState {
  readonly id: string;
  readonly props: {
    active: boolean;
    size: BorderBeamSize;
    colorVariant: BorderBeamColorVariant;
    theme: BorderBeamTheme;
    staticColors: boolean;
    duration?: number | undefined;
    borderRadius?: number | undefined;
    brightness?: number | undefined;
    saturation?: number | undefined;
    hueRange: number;
    strength: number;
    density: number;
  };
  readonly wrapper: HTMLDivElement | null;
  isActive: boolean;
  isFading: boolean;
  isVisible: boolean;
  detectedRadius: number | null;
  pulseGlowScale: { x: number; y: number };
  isFlowing: boolean;
  flowKey: number;
  flowPoint: BorderBeamFlowPoint;
  flowRadius: number;
  flowBox: { width: number; height: number };
  flowSeed: number;
  readonly systemTheme: 'dark' | 'light';
  readonly resolvedTheme: 'dark' | 'light';
  readonly themeConfig: ThemeColors;
  readonly sizeConfig: SizeConfig;
  readonly isPulse: boolean;
  readonly finalBorderRadius: number;
  readonly finalDuration: number;
  readonly finalSaturation: number;
  readonly finalBrightness: number;
  readonly finalHueRange: number;
  readonly finalStaticColors: boolean;
  readonly cssStyles: string;
  readonly driverConfig: PulseDriverConfig | null;
}
export function createBorderBeamFoundation(
  state: BorderBeamState,
  callbacks: { afterRender(task: () => void): void; activate(): void; deactivate(): void },
) {
  const props = state.props,
    id = state.id;
  state.isActive = props.active;
  let flowTimer: number | null = null;
  function resolveTheme(theme: BorderBeamTheme, sysTheme: 'dark' | 'light'): 'dark' | 'light' {
    return theme === 'auto' ? sysTheme : theme;
  }

  function clearFlowTimer() {
    if (!flowTimer) return;
    window.clearTimeout(flowTimer);
    flowTimer = null;
  }

  function finishFlow() {
    clearFlowTimer();
    state.isFlowing = false;

    // Reconcile to the `active` prop once the one-shot entrance is done. The
    // `active` watcher only fires on prop *changes*, so a steady `active=false`
    // would otherwise leave the beam stuck on after `flowFrom` forced it active.
    // With this, a controlled `active=false` fades the border out (and reduced-
    // motion users skip straight to hidden).
    if (!props.active && state.isActive && !state.isFading) {
      if (shouldReduceMotion()) {
        state.isActive = false;
      } else {
        state.isFading = true;
      }
    }
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
    return Math.max(1, Math.round((point.x * 3 + point.y * 5 + state.flowKey * 17) % 997));
  }

  function getFlowDisplacement() {
    return Math.max(8, Math.min(24, state.flowRadius * 0.07));
  }

  function getFlowColors() {
    const isDark = state.resolvedTheme === 'dark';
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
  }

  function shouldReduceMotion() {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
  }

  function flowFrom(coordinate?: BorderBeamFlowCoordinate) {
    const el = state.wrapper;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const point = resolveFlowPoint(coordinate, rect);

    state.flowKey += 1;
    state.flowBox = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
    state.flowPoint = point;
    state.flowRadius = getFlowRadius(point, rect);
    state.flowSeed = getFlowSeed(point);
    state.isActive = true;
    state.isFading = false;

    if (shouldReduceMotion()) {
      finishFlow();
      return;
    }

    clearFlowTimer();
    state.isFlowing = true;
    flowTimer = window.setTimeout(finishFlow, 760);
  }

  function handleFlowAnimationEnd() {
    finishFlow();
  }

  let mutationObserver: MutationObserver | null = null;

  function getSlotElement(): HTMLElement | null {
    const el = state.wrapper;
    if (!el) return null;
    for (const child of Array.from(el.children)) {
      if (child.hasAttribute('data-beam-bloom') || child.hasAttribute('data-beam-flow')) continue;
      return child as HTMLElement;
    }
    return null;
  }

  function mountRadius() {
    let observedChild: HTMLElement | null = null;
    const detect = () => {
      const child = getSlotElement();
      if (child !== observedChild && mutationObserver && state.wrapper) {
        mutationObserver.disconnect();
        mutationObserver.observe(state.wrapper, { childList: true });
        if (child)
          mutationObserver.observe(child, {
            attributes: true,
            attributeFilter: ['class', 'style'],
          });
        observedChild = child;
        setupPulseGlowScale();
      }
      if (!child) {
        state.detectedRadius = null;
        return;
      }
      const computed = getComputedStyle(child);
      const raw = parseFloat(computed.borderTopLeftRadius);
      if (!isNaN(raw) && raw >= 0) {
        state.detectedRadius = raw;
      }
    };

    callbacks.afterRender(() => {
      const el = state.wrapper;
      if (!el) return;
      mutationObserver = new MutationObserver(detect);
      mutationObserver.observe(el, {
        childList: true,
      });
      detect();
    });
  }

  let intersectionCleanup: (() => void) | null = null;

  function mountIntersection() {
    const el = state.wrapper;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) state.isVisible = entry.isIntersecting;
      },
      { rootMargin: '256px' },
    );

    observer.observe(el);
    intersectionCleanup = () => observer.disconnect();
  }

  function disposeFlow() {
    clearFlowTimer();
    mutationObserver?.disconnect();
  }

  function syncActive(active: boolean) {
    if (active) {
      state.isActive = true;
      state.isFading = false;
    } else if (!active && state.isActive && !state.isFading) {
      if (shouldReduceMotion()) {
        state.isActive = false;
        callbacks.deactivate();
      } else state.isFading = true;
    }
  }

  function disposeIntersection() {
    intersectionCleanup?.();
  }

  let resizeObserverCleanup: (() => void) | null = null;

  let resizeGeneration = 0;

  function setupPulseGlowScale() {
    const generation = ++resizeGeneration;
    resizeObserverCleanup?.();
    resizeObserverCleanup = null;

    if (props.size !== 'pulse-outside') {
      state.pulseGlowScale = { x: 1, y: 1 };
      return;
    }

    const el = state.wrapper;
    if (!el) return;

    const REF_WIDTH = 350;
    const REF_HEIGHT = 140;
    const MIN_SCALE = 0.35;
    const MAX_SCALE = 4;
    const clamp = (value: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));

    const measure = () => {
      const child = getSlotElement();
      if (!child) {
        state.pulseGlowScale = { x: 1, y: 1 };
        return;
      }
      const rect = child.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = +clamp(rect.width / REF_WIDTH).toFixed(3);
      const y = +clamp(rect.height / REF_HEIGHT).toFixed(3);
      if (state.pulseGlowScale.x !== x || state.pulseGlowScale.y !== y) {
        state.pulseGlowScale = { x, y };
      }
    };

    callbacks.afterRender(() => {
      if (generation !== resizeGeneration || !state.wrapper) return;
      measure();
      if (typeof ResizeObserver === 'undefined') return;
      const child = getSlotElement();
      if (!child) return;
      const ro = new ResizeObserver(measure);
      ro.observe(child);
      resizeObserverCleanup = () => ro.disconnect();
    });
  }

  function syncSize() {
    setupPulseGlowScale();
  }

  function mountScale() {
    setupPulseGlowScale();
  }

  function disposeScale() {
    resizeGeneration++;
    resizeObserverCleanup?.();
  }

  function handleAnimationEnd(e: AnimationEvent) {
    // 伪元素动画结束事件不参与 activate/deactivate 判定
    if (e.pseudoElement) return;
    // 只匹配本实例的 fade 动画名（精确匹配），插槽内元素自己的 fade-in-up
    // 等动画不再误触
    const animationName = e.animationName || '';
    if (animationName === `beam-fade-out-${id}`) {
      state.isActive = false;
      state.isFading = false;
      callbacks.deactivate();
    } else if (animationName === `beam-fade-in-${id}`) {
      callbacks.activate();
    }
  }

  function getResolvedTheme() {
    return resolveTheme(props.theme, state.systemTheme);
  }

  function getThemeConfig() {
    return sizeThemePresets[props.size][state.resolvedTheme];
  }

  function getSizeConfig() {
    return sizePresets[props.size];
  }

  function getIsPulse() {
    return props.size === 'pulse-inner' || props.size === 'pulse-outside';
  }

  function getFinalBorderRadius() {
    return props.borderRadius ?? state.detectedRadius ?? state.sizeConfig.borderRadius;
  }

  function getDefaultDuration(size: BorderBeamSize, isPulse: boolean): number {
    if (size === 'line') return 3.1;
    if (isPulse) return 2.3;
    return 1.96;
  }

  function getFinalDuration() {
    return props.duration ?? getDefaultDuration(props.size, state.isPulse);
  }

  function getFinalSaturation() {
    return props.saturation ?? state.themeConfig.saturation;
  }

  function getFinalBrightness() {
    return props.brightness ?? state.themeConfig.brightness ?? 1.3;
  }

  function getFinalHueRange() {
    return props.size === 'line' ? Math.min(props.hueRange, 13) : props.hueRange;
  }

  function getFinalStaticColors() {
    return props.colorVariant === 'mono' ? true : props.staticColors;
  }

  function getCssStyles() {
    return generateBeamCSS({
      id,
      borderRadius: state.finalBorderRadius,
      borderWidth: state.sizeConfig.borderWidth,
      duration: state.finalDuration,
      strokeOpacity: state.themeConfig.strokeOpacity,
      innerOpacity: state.themeConfig.innerOpacity,
      bloomOpacity: state.themeConfig.bloomOpacity,
      innerShadow: state.themeConfig.innerShadow,
      size: props.size,
      colorVariant: props.colorVariant,
      staticColors: state.finalStaticColors,
      brightness: state.finalBrightness,
      saturation: state.finalSaturation,
      hueRange: state.finalHueRange,
      theme: state.resolvedTheme,
      hairlineOpacity: state.themeConfig.hairlineOpacity,
    });
  }

  let styleEl: HTMLStyleElement | null = null;

  function ensureStyleEl(): HTMLStyleElement {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-beam-style', id);
      document.head.appendChild(styleEl);
    }
    return styleEl;
  }

  function mountStyle() {
    ensureStyleEl().textContent = state.cssStyles;
  }

  function syncCss(css: string) {
    ensureStyleEl().textContent = css;
  }

  function disposeStyle() {
    styleEl?.remove();
    styleEl = null;
  }

  function getDriverConfig() {
    return state.isPulse
      ? getPulseDriverConfig(
          props.size,
          state.resolvedTheme,
          state.finalDuration,
          state.finalHueRange,
          state.finalStaticColors,
          id,
        )
      : null;
  }

  let unregisterPulse: (() => void) | null = null;

  function syncPulseDriver() {
    if (unregisterPulse) {
      unregisterPulse();
      unregisterPulse = null;
    }

    if (!state.driverConfig) return;
    if (!(state.isActive || state.isFading) || !state.isVisible) return;

    const el = state.wrapper;
    if (!el) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    unregisterPulse = registerPulseInstance(el, state.driverConfig);
  }

  function mountPulse() {
    syncPulseDriver();
  }

  function syncPulse() {
    syncPulseDriver();
  }

  function syncReducedMotion(reduce: boolean) {
    if (!reduce) return;
    if (state.isFlowing) finishFlow();
    if (state.isFading) {
      state.isActive = false;
      state.isFading = false;
      callbacks.deactivate();
    }
  }

  function disposePulse() {
    if (unregisterPulse) {
      unregisterPulse();
      unregisterPulse = null;
    }
  }

  function getMergedStyle() {
    return {
      '--beam-strength': Math.max(0, Math.min(1, props.strength)),
      '--beam-density': Math.max(0.1, props.density),
      '--beam-flow-x': `${state.flowPoint.x}px`,
      '--beam-flow-y': `${state.flowPoint.y}px`,
      '--beam-flow-radius': `${state.flowRadius}px`,
      ...(props.size === 'pulse-outside'
        ? { '--pulse-glow-sx': state.pulseGlowScale.x, '--pulse-glow-sy': state.pulseGlowScale.y }
        : {}),
    };
  }
  return {
    getFlowDisplacement,
    getFlowColors,
    flowFrom,
    handleFlowAnimationEnd,
    mountRadius,
    mountIntersection,
    disposeFlow,
    syncActive,
    disposeIntersection,
    syncSize,
    mountScale,
    disposeScale,
    handleAnimationEnd,
    getResolvedTheme,
    getThemeConfig,
    getSizeConfig,
    getIsPulse,
    getFinalBorderRadius,
    getFinalDuration,
    getFinalSaturation,
    getFinalBrightness,
    getFinalHueRange,
    getFinalStaticColors,
    getCssStyles,
    mountStyle,
    syncCss,
    disposeStyle,
    getDriverConfig,
    mountPulse,
    syncPulse,
    syncReducedMotion,
    disposePulse,
    getMergedStyle,
  };
}
