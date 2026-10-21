import type { SetRequired } from 'type-fest';

import type { VoiceGeometry, VoiceTypeStyle } from './presets.js';
import type { VoiceGlowProps, VoiceThemeColors } from './types.js';

import { toTriple } from './color.js';
import { resolveVoiceDefaults, resolveVoiceStyle } from './presets.js';
import { themePresets, generateVoiceBeamCSS } from './styles.js';
import { registerVoiceInstance, type VoiceDriverConfig } from './voiceDriver.js';
export type VoiceGlowFoundationProps = SetRequired<
  VoiceGlowProps,
  | 'type'
  | 'theme'
  | 'colorVariant'
  | 'level'
  | 'sensitivity'
  | 'threshold'
  | 'attack'
  | 'release'
  | 'breatheDuration'
  | 'bands'
  | 'processing'
  | 'processingEase'
  | 'active'
  | 'paused'
  | 'staticColors'
>;
export interface VoiceGlowState {
  readonly id: string;
  readonly props: VoiceGlowFoundationProps;
  readonly wrapper: HTMLElement | undefined;
  isActive: boolean;
  isFading: boolean;
  detectedRadius: number;
  readonly systemTheme: 'dark' | 'light';
  readonly reducedMotion: boolean;
  readonly resolvedTheme: 'dark' | 'light';
  readonly defaults: VoiceGeometry;
  readonly geometry: VoiceGeometry;
  readonly palette: VoiceThemeColors;
  readonly typeStyle: VoiceTypeStyle;
  readonly scale: number;
  readonly coreLight: number;
  readonly distortion: number;
  readonly distortionDetail: number;
  readonly radius: number;
  readonly bandColors: VoiceDriverConfig['bandColors'];
  readonly css: string;
  readonly driverConfig: VoiceDriverConfig;
}
export function supportsVoiceCanvasFilter() {
  return (
    typeof document === 'undefined' ||
    typeof document.createElement('canvas').getContext('2d')?.filter === 'string'
  );
}
export function createVoiceGlowFoundation(
  state: VoiceGlowState,
  callbacks: { level(value: number): void; activate(): void; deactivate(): void },
) {
  const props = state.props,
    id = state.id;
  state.isActive = props.active;
  function getResolvedTheme() {
    return props.theme === 'auto' ? state.systemTheme : props.theme;
  }

  function getDefaults() {
    return resolveVoiceDefaults(props.type, state.resolvedTheme);
  }

  function getPalette() {
    return themePresets[state.resolvedTheme];
  }

  function getTypeStyle() {
    return resolveVoiceStyle(props.type, state.resolvedTheme);
  }

  function getScale() {
    return Math.max(0.05, props.scale ?? state.defaults.scale);
  }

  function getGeometry() {
    const result = { ...state.defaults };
    for (const key of Object.keys(result) as (keyof typeof result)[]) {
      const override = props[key];
      if (typeof override === 'number') result[key] = override;
    }
    return result;
  }

  function getCoreLight() {
    return Math.max(0, Math.min(3, state.geometry.coreLight));
  }

  function getDistortion() {
    return state.geometry.distortion;
  }

  function getDistortionDetail() {
    return state.geometry.distortionDetail / state.scale;
  }

  function getRadius() {
    return props.borderRadius ?? state.detectedRadius;
  }

  function getBandColors() {
    const defaults =
      state.resolvedTheme === 'dark'
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
  }

  function getCss() {
    const g = state.geometry;
    return (
      generateVoiceBeamCSS({
        id,
        borderRadius: state.radius,
        borderWidth: 1,
        strokeOpacity: state.palette.strokeOpacity * g.strokeOpacity,
        innerOpacity: state.palette.innerOpacity * g.innerOpacity,
        bloomOpacity: state.palette.bloomOpacity * g.bloomOpacity,
        innerShadow: state.palette.innerShadow,
        colorVariant: props.colorVariant,
        colors: props.colors,
        brightness: props.brightness ?? state.typeStyle.brightness ?? state.palette.brightness,
        saturation: props.saturation ?? state.typeStyle.saturation ?? state.palette.saturation,
        theme: state.resolvedTheme,
        hueBase: state.palette.hueBase,
        glowSize: g.glowSize * state.scale,
        glowWidth: g.glowWidth * state.scale,
        glowHeight: g.glowHeight * state.scale,
        strokeScale: g.strokeScale,
        innerScale: g.innerScale,
        innerHeight: g.innerHeight,
        bloomScale: g.bloomScale,
        bloomHeight: g.bloomHeight,
        coreSize: g.coreSize * state.scale,
        coreLight: state.coreLight,
        coreLightWidth: g.coreLightWidth,
        coreLightHeight: g.coreLightHeight,
        rangeWidth: g.rangeWidth * state.scale,
        rangeHeight: g.rangeHeight * state.scale,
        softness: g.softness,
        distortion: state.distortion > 0,
        scale: state.scale,
      }) + (props.css ? `\n${props.css.replaceAll('{id}', id)}` : '')
    );
  }

  function getDriverConfig() {
    const g = state.geometry;
    const sc = state.scale;
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
      theme: state.resolvedTheme,
      bandColors: state.bandColors,
      distortion: state.distortion,
      coreLight: state.coreLight,
      scale: sc,
      radius: state.radius,
      processing: props.processing,
      processingDuration: g.processingDuration,
      processingLevel: g.processingLevel,
      processingEase: props.processingEase,
      processingTravel: g.processingTravel,
      processingCurve: g.processingCurve,
      cornerFollow: g.cornerFollow,
      hueRange: props.hueRange ?? state.palette.hueRange ?? 24,
      hueDuration: props.hueDuration ?? state.palette.hueDuration ?? 12,
      staticColors: props.colorVariant === 'mono' || props.staticColors,
      reducedMotion: state.reducedMotion,
      paused: props.paused,
    };
  }

  function syncActive(active: boolean) {
    if (active) {
      state.isActive = true;
      state.isFading = false;
    } else if (state.isActive) {
      state.isFading = true;
    }
  }

  const handleAnimationEnd = (event: AnimationEvent) => {
    if (event.target !== state.wrapper || event.pseudoElement) return;
    if (event.animationName === `vb-fade-in-${id}`) {
      callbacks.activate();
    }
    if (event.animationName === `vb-fade-out-${id}`) {
      state.isActive = false;
      state.isFading = false;
      callbacks.deactivate();
    }
  };

  function mountRadius() {
    const host = state.wrapper;
    if (!host) return;
    const child = host.firstElementChild;
    const radiusSource = child?.hasAttribute('data-voice-beam-bloom') ? host.parentElement : child;
    if (radiusSource) {
      state.detectedRadius = parseFloat(getComputedStyle(radiusSource).borderTopLeftRadius) || 16;
    }
  }

  function connectDriver(onCleanup: (cleanup: () => void) => void) {
    if (!state.wrapper || !(state.isActive || state.isFading)) return;
    const cleanup = registerVoiceInstance(
      state.wrapper,
      state.driverConfig,
      {
        stream: props.stream,
        getLevel: () => (typeof props.level === 'function' ? props.level() : props.level),
      },
      (level) => {
        callbacks.level(level);
      },
    );
    onCleanup(cleanup);
  }

  let styleElement: HTMLStyleElement | undefined;

  function syncCss(value: string) {
    if (styleElement) styleElement.textContent = value;
  }

  function mountStyle() {
    styleElement = document.createElement('style');
    styleElement.textContent = state.css;
    state.wrapper?.before(styleElement);
  }

  function disposeStyle() {
    styleElement?.remove();
  }
  return {
    getResolvedTheme,
    getDefaults,
    getPalette,
    getTypeStyle,
    getScale,
    getGeometry,
    getCoreLight,
    getDistortion,
    getDistortionDetail,
    getRadius,
    getBandColors,
    getCss,
    getDriverConfig,
    syncActive,
    handleAnimationEnd,
    mountRadius,
    connectDriver,
    syncCss,
    mountStyle,
    disposeStyle,
  };
}
