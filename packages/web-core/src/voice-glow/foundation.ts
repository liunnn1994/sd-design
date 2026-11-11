import type { SetRequired } from 'type-fest';

import type { VoiceGlowProps } from './types.js';

import { toTriple } from './color.js';
import { resolveVoiceDefaults, resolveVoiceStyle } from './presets.js';
import { themePresets, generateVoiceBeamCSS } from './styles.js';
import { registerVoiceInstance } from './voiceDriver.js';
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
export const voiceGlowPropDefaults = {
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
} as const satisfies Partial<VoiceGlowProps>;
export interface VoiceGlowState {
  readonly id: string;
  readonly props: VoiceGlowFoundationProps;
  readonly wrapper: HTMLElement | undefined;
  isActive: boolean;
  isFading: boolean;
  detectedRadius: number;
  readonly systemTheme: 'dark' | 'light';
  readonly reducedMotion: boolean;
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
  const id = state.id;
  state.isActive = state.props.active;
  function getResolvedTheme() {
    return state.props.theme === 'auto' ? state.systemTheme : state.props.theme;
  }

  function getDefaults() {
    return resolveVoiceDefaults(state.props.type, getResolvedTheme());
  }

  function getPalette() {
    return themePresets[getResolvedTheme()];
  }

  function getTypeStyle() {
    return resolveVoiceStyle(state.props.type, getResolvedTheme());
  }

  function getScale() {
    return Math.max(0.05, state.props.scale ?? getDefaults().scale);
  }

  function getGeometry() {
    const result = { ...getDefaults() };
    for (const key of Object.keys(result) as (keyof typeof result)[]) {
      const override = state.props[key];
      if (typeof override === 'number') result[key] = override;
    }
    return result;
  }

  function getCoreLight() {
    return Math.max(0, Math.min(3, getGeometry().coreLight));
  }

  function getDistortion() {
    return getGeometry().distortion;
  }

  function getDistortionDetail() {
    return getGeometry().distortionDetail / getScale();
  }

  function getRadius() {
    return state.props.borderRadius ?? state.detectedRadius;
  }

  function getBandColors() {
    const defaults =
      getResolvedTheme() === 'dark'
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
      core: toTriple(state.props.bandColors?.core ?? '') ?? defaults.core,
      above: toTriple(state.props.bandColors?.above ?? '') ?? defaults.above,
      mid: toTriple(state.props.bandColors?.mid ?? '') ?? defaults.mid,
      below: toTriple(state.props.bandColors?.below ?? '') ?? defaults.below,
    };
  }

  function getCss() {
    const g = getGeometry();
    return (
      generateVoiceBeamCSS({
        id,
        borderRadius: getRadius(),
        borderWidth: 1,
        strokeOpacity: getPalette().strokeOpacity * g.strokeOpacity,
        innerOpacity: getPalette().innerOpacity * g.innerOpacity,
        bloomOpacity: getPalette().bloomOpacity * g.bloomOpacity,
        innerShadow: getPalette().innerShadow,
        colorVariant: state.props.colorVariant,
        colors: state.props.colors,
        brightness: state.props.brightness ?? getTypeStyle().brightness ?? getPalette().brightness,
        saturation: state.props.saturation ?? getTypeStyle().saturation ?? getPalette().saturation,
        theme: getResolvedTheme(),
        hueBase: getPalette().hueBase,
        glowSize: g.glowSize * getScale(),
        glowWidth: g.glowWidth * getScale(),
        glowHeight: g.glowHeight * getScale(),
        strokeScale: g.strokeScale,
        innerScale: g.innerScale,
        innerHeight: g.innerHeight,
        bloomScale: g.bloomScale,
        bloomHeight: g.bloomHeight,
        coreSize: g.coreSize * getScale(),
        coreLight: getCoreLight(),
        coreLightWidth: g.coreLightWidth,
        coreLightHeight: g.coreLightHeight,
        rangeWidth: g.rangeWidth * getScale(),
        rangeHeight: g.rangeHeight * getScale(),
        softness: g.softness,
        distortion: getDistortion() > 0,
        scale: getScale(),
      }) + (state.props.css ? `\n${state.props.css.replaceAll('{id}', id)}` : '')
    );
  }

  function getDriverConfig() {
    const g = getGeometry();
    const sc = getScale();
    return {
      id,
      sensitivity: state.props.sensitivity,
      threshold: state.props.threshold,
      attack: state.props.attack,
      release: state.props.release,
      idle: g.idle,
      breatheDuration: state.props.breatheDuration,
      reach: g.reach,
      spread: g.spread,
      bands: state.props.bands,
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
      theme: getResolvedTheme(),
      bandColors: getBandColors(),
      distortion: getDistortion(),
      coreLight: getCoreLight(),
      scale: sc,
      radius: getRadius(),
      processing: state.props.processing,
      processingDuration: g.processingDuration,
      processingLevel: g.processingLevel,
      processingEase: state.props.processingEase,
      processingTravel: g.processingTravel,
      processingCurve: g.processingCurve,
      cornerFollow: g.cornerFollow,
      hueRange: state.props.hueRange ?? getPalette().hueRange ?? 24,
      hueDuration: state.props.hueDuration ?? getPalette().hueDuration ?? 12,
      staticColors: state.props.colorVariant === 'mono' || state.props.staticColors,
      reducedMotion: state.reducedMotion,
      paused: state.props.paused,
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
      getDriverConfig(),
      {
        stream: state.props.stream,
        getLevel: () =>
          typeof state.props.level === 'function' ? state.props.level() : state.props.level,
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
    styleElement.textContent = getCss();
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
