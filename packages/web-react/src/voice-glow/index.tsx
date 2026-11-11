import type { VoiceGlowFoundationProps } from '@sdata/web-core/voice-glow/foundation';
import type { VoiceGlowProps as CoreProps } from '@sdata/web-core/voice-glow/types';
import type { ComponentPropsWithRef, CSSProperties } from 'react';

import {
  createVoiceGlowFoundation,
  supportsVoiceCanvasFilter,
  voiceGlowPropDefaults,
} from '@sdata/web-core/voice-glow/foundation';
import { useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { useBeamPreferences } from '../_shared/use-beam-preferences.js';
import { usePrefix } from '../config-provider/index.js';
export type {
  VoiceGlowType,
  VoiceGlowTheme,
  VoiceGlowColorVariant,
  VoiceGlowLevel,
} from '@sdata/web-core/voice-glow/types';
export {
  voiceDefaults,
  voiceTypePresets,
  resolveVoiceDefaults,
  resolveVoiceStyle,
} from '@sdata/web-core/voice-glow/presets';
export { useVoiceMicrophone } from './use-voice-microphone.js';
export type {
  UseVoiceMicrophoneOptions,
  UseVoiceMicrophoneResult,
  VoiceMicrophoneState,
} from './use-voice-microphone.js';
export type VoiceGlowInstance = HTMLDivElement;
export interface VoiceGlowProps extends CoreProps<CSSProperties>, ComponentPropsWithRef<'div'> {}
export function VoiceGlow({
  type = voiceGlowPropDefaults.type,
  scale,
  stream,
  level = voiceGlowPropDefaults.level,
  sensitivity = voiceGlowPropDefaults.sensitivity,
  threshold = voiceGlowPropDefaults.threshold,
  attack = voiceGlowPropDefaults.attack,
  release = voiceGlowPropDefaults.release,
  idle,
  breatheDuration = voiceGlowPropDefaults.breatheDuration,
  reach,
  spread,
  bands = voiceGlowPropDefaults.bands,
  flow,
  processing = voiceGlowPropDefaults.processing,
  processingDuration,
  processingLevel,
  processingEase = voiceGlowPropDefaults.processingEase,
  processingTravel,
  processingCurve,
  cornerFollow,
  colorVariant = voiceGlowPropDefaults.colorVariant,
  colors,
  bandColors,
  theme = voiceGlowPropDefaults.theme,
  staticColors = voiceGlowPropDefaults.staticColors,
  hueRange,
  hueDuration,
  active = voiceGlowPropDefaults.active,
  paused = voiceGlowPropDefaults.paused,
  borderRadius,
  brightness,
  saturation,
  glowSize,
  strokeOpacity,
  innerOpacity,
  bloomOpacity,
  bend,
  bandStrength,
  bandWidth,
  bandPosition,
  bandCurve,
  bandSpread,
  bandSkew,
  bandOffset,
  bandTail,
  bandTailPosition,
  bandTailCurve,
  bandTailOverflow,
  bandAberration,
  distortion,
  distortionDetail,
  glowWidth,
  glowHeight,
  lobeSpacing,
  rangeWidth,
  rangeHeight,
  softness,
  coreSize,
  coreLight,
  coreLightWidth,
  coreLightHeight,
  strokeScale,
  innerScale,
  innerHeight,
  bloomScale,
  bloomHeight,
  strength,
  css,
  className,
  style,
  onLevel,
  onActivate,
  onDeactivate,
  onAnimationEnd,
  ref,
  children,
  ...attrs
}: VoiceGlowProps) {
  const prefix = usePrefix('voice-glow');
  const id = `vg-react-${useId().replaceAll(':', '')}`;
  const wrapper = useRef<HTMLDivElement>(null);
  const preferences = useBeamPreferences();
  const options: VoiceGlowFoundationProps = {
    type,
    scale,
    stream,
    level,
    sensitivity,
    threshold,
    attack,
    release,
    idle,
    breatheDuration,
    reach,
    spread,
    bands,
    flow,
    processing,
    processingDuration,
    processingLevel,
    processingEase,
    processingTravel,
    processingCurve,
    cornerFollow,
    colorVariant,
    colors,
    bandColors,
    theme,
    staticColors,
    hueRange,
    hueDuration,
    active,
    paused,
    borderRadius,
    brightness,
    saturation,
    glowSize,
    strokeOpacity,
    innerOpacity,
    bloomOpacity,
    bend,
    bandStrength,
    bandWidth,
    bandPosition,
    bandCurve,
    bandSpread,
    bandSkew,
    bandOffset,
    bandTail,
    bandTailPosition,
    bandTailCurve,
    bandTailOverflow,
    bandAberration,
    distortion,
    distortionDetail,
    glowWidth,
    glowHeight,
    lobeSpacing,
    rangeWidth,
    rangeHeight,
    softness,
    coreSize,
    coreLight,
    coreLightWidth,
    coreLightHeight,
    strokeScale,
    innerScale,
    innerHeight,
    bloomScale,
    bloomHeight,
    strength,
    css,
  };
  const live = useRef(options);
  live.current = options;
  const callbacks = useRef({ onLevel, onActivate, onDeactivate });
  callbacks.current = { onLevel, onActivate, onDeactivate };
  const connected = useRef(false);
  const data = useRef({ isActive: active, isFading: false, detectedRadius: 16 });
  const [, render] = useState(0);
  const [canvasFilter, setCanvasFilter] = useState(true);
  const [foundation] = useState(() => {
    const update = <K extends keyof typeof data.current>(
      key: K,
      value: (typeof data.current)[K],
    ) => {
      if (data.current[key] !== value) {
        data.current[key] = value;
        if (connected.current) render((version) => version + 1);
      }
    };
    return createVoiceGlowFoundation(
      {
        id,
        get props() {
          return live.current;
        },
        get wrapper() {
          return connected.current ? (wrapper.current ?? undefined) : undefined;
        },
        get systemTheme() {
          return preferences.systemTheme;
        },
        get reducedMotion() {
          return preferences.reducedMotion;
        },
        get isActive() {
          return data.current.isActive;
        },
        set isActive(value) {
          update('isActive', value);
        },
        get isFading() {
          return data.current.isFading;
        },
        set isFading(value) {
          update('isFading', value);
        },
        get detectedRadius() {
          return data.current.detectedRadius;
        },
        set detectedRadius(value) {
          update('detectedRadius', value);
        },
      },
      {
        level: (value) => callbacks.current.onLevel?.(value),
        activate: () => callbacks.current.onActivate?.(),
        deactivate: () => callbacks.current.onDeactivate?.(),
      },
    );
  });
  const generatedCss = foundation.getCss();
  const driverKey = JSON.stringify(foundation.getDriverConfig());
  useLayoutEffect(() => {
    connected.current = true;
    setCanvasFilter(supportsVoiceCanvasFilter());
    foundation.mountRadius();
    foundation.mountStyle();
    return () => {
      connected.current = false;
      foundation.disposeStyle();
    };
  }, [foundation]);
  useLayoutEffect(() => foundation.syncActive(active), [foundation, active]);
  useLayoutEffect(() => foundation.syncCss(generatedCss), [foundation, generatedCss]);
  useLayoutEffect(() => {
    let cleanup: (() => void) | undefined;
    foundation.connectDriver((value) => {
      cleanup = value;
    });
    return () => cleanup?.();
  }, [foundation, driverKey, stream, data.current.isActive, data.current.isFading, canvasFilter]);
  useImperativeHandle(ref, () => wrapper.current!, []);
  const core = foundation.getCoreLight();
  const warp = foundation.getDistortion();
  const detail = foundation.getDistortionDetail();
  return (
    <div
      {...attrs}
      ref={wrapper}
      className={[prefix, className].filter(Boolean).join(' ')}
      data-voice-beam={id}
      data-voice-type={type}
      data-voice-halfres=""
      data-active={data.current.isActive && !data.current.isFading ? '' : undefined}
      data-fading={data.current.isFading ? '' : undefined}
      data-paused={paused ? '' : undefined}
      data-listening={stream ? '' : undefined}
      data-processing={processing ? '' : undefined}
      style={
        {
          ...style,
          '--voice-strength':
            strength ?? foundation.getTypeStyle().strength ?? foundation.getPalette().strength ?? 1,
        } as CSSProperties
      }
      onAnimationEnd={(event) => {
        onAnimationEnd?.(event);
        foundation.handleAnimationEnd(event.nativeEvent);
      }}
    >
      {children}
      <div data-voice-beam-bloom="" />
      {warp > 0 && (
        <>
          <div data-voice-beam-warp="inner" />
          <div data-voice-beam-warp="bloom" />
        </>
      )}
      {!canvasFilter && <canvas data-voice-beam-band-halo="" aria-hidden="true" />}
      <canvas data-voice-beam-band="" aria-hidden="true" />
      {core > 0 && (
        <div data-voice-beam-core="">
          <div />
        </div>
      )}
      {warp > 0 && (
        <svg aria-hidden="true" width="0" height="0" className="sd-voice-glow-filter">
          <filter
            id={`vb-distort-${id}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${(0.012 * detail).toFixed(4)} ${(0.05 * detail).toFixed(4)}`}
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
      )}
    </div>
  );
}
export default VoiceGlow;
