import type {
  BorderBeamProps as CoreProps,
  BorderBeamExposed,
} from '@sdata/web-core/border-beam/types';
import type { ComponentPropsWithoutRef, CSSProperties, Ref } from 'react';

import { createBorderBeamFoundation } from '@sdata/web-core/border-beam/foundation';
import { useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useBeamPreferences } from '../_shared/use-beam-preferences.js';
import { usePrefix } from '../config-provider/index.js';
export type {
  BorderBeamSize,
  BorderBeamTheme,
  BorderBeamColorVariant,
  BorderBeamFlowPreset,
  BorderBeamFlowPoint,
  BorderBeamFlowCoordinate,
  BorderBeamExposed,
} from '@sdata/web-core/border-beam/types';
export type BorderBeamInstance = BorderBeamExposed;
export interface BorderBeamProps extends CoreProps, ComponentPropsWithoutRef<'div'> {
  ref?: Ref<BorderBeamExposed>;
  onActivate?: () => void;
  onDeactivate?: () => void;
}
export function BorderBeam({
  size = 'md',
  colorVariant = 'colorful',
  theme = 'dark',
  staticColors = false,
  duration,
  active = true,
  borderRadius,
  brightness,
  saturation,
  hueRange = 30,
  strength = 1,
  density = 1,
  ref,
  onActivate,
  onDeactivate,
  onAnimationEnd,
  children,
  className,
  style,
  ...attrs
}: BorderBeamProps) {
  const prefix = usePrefix('border-beam');
  const id = `bb-react-${useId().replaceAll(':', '')}`;
  const wrapper = useRef<HTMLDivElement>(null);
  const preferences = useBeamPreferences();
  const afterRender = useAfterRender();
  const live = useRef({
    size,
    colorVariant,
    theme,
    staticColors,
    duration,
    active,
    borderRadius,
    brightness,
    saturation,
    hueRange,
    strength,
    density,
    onActivate,
    onDeactivate,
  });
  live.current = {
    size,
    colorVariant,
    theme,
    staticColors,
    duration,
    active,
    borderRadius,
    brightness,
    saturation,
    hueRange,
    strength,
    density,
    onActivate,
    onDeactivate,
  };
  const connected = useRef(false);
  const generation = useRef(0);
  const data = useRef({
    isActive: active,
    isFading: false,
    isVisible: true,
    detectedRadius: null as number | null,
    pulseGlowScale: { x: 1, y: 1 },
    isFlowing: false,
    flowKey: 0,
    flowPoint: { x: 0, y: 0 },
    flowRadius: 0,
    flowBox: { width: 1, height: 1 },
    flowSeed: 1,
  });
  const [, render] = useState(0);
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
    return createBorderBeamFoundation(
      {
        id,
        props: {
          get size() {
            return live.current.size;
          },
          get colorVariant() {
            return live.current.colorVariant;
          },
          get theme() {
            return live.current.theme;
          },
          get staticColors() {
            return live.current.staticColors;
          },
          get duration() {
            return live.current.duration;
          },
          get active() {
            return live.current.active;
          },
          get borderRadius() {
            return live.current.borderRadius;
          },
          get brightness() {
            return live.current.brightness;
          },
          get saturation() {
            return live.current.saturation;
          },
          get hueRange() {
            return live.current.hueRange;
          },
          get strength() {
            return live.current.strength;
          },
          get density() {
            return live.current.density;
          },
        },
        get wrapper() {
          return connected.current ? wrapper.current : null;
        },
        get systemTheme() {
          return preferences.systemTheme;
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
        get isVisible() {
          return data.current.isVisible;
        },
        set isVisible(value) {
          update('isVisible', value);
        },
        get detectedRadius() {
          return data.current.detectedRadius;
        },
        set detectedRadius(value) {
          update('detectedRadius', value);
        },
        get pulseGlowScale() {
          return data.current.pulseGlowScale;
        },
        set pulseGlowScale(value) {
          update('pulseGlowScale', value);
        },
        get isFlowing() {
          return data.current.isFlowing;
        },
        set isFlowing(value) {
          update('isFlowing', value);
        },
        get flowKey() {
          return data.current.flowKey;
        },
        set flowKey(value) {
          update('flowKey', value);
        },
        get flowPoint() {
          return data.current.flowPoint;
        },
        set flowPoint(value) {
          update('flowPoint', value);
        },
        get flowRadius() {
          return data.current.flowRadius;
        },
        set flowRadius(value) {
          update('flowRadius', value);
        },
        get flowBox() {
          return data.current.flowBox;
        },
        set flowBox(value) {
          update('flowBox', value);
        },
        get flowSeed() {
          return data.current.flowSeed;
        },
        set flowSeed(value) {
          update('flowSeed', value);
        },
      },
      {
        afterRender(task) {
          const current = generation.current;
          void afterRender().then(() => {
            if (connected.current && generation.current === current) task();
          });
        },
        activate: () => live.current.onActivate?.(),
        deactivate: () => live.current.onDeactivate?.(),
      },
    );
  });
  const resolvedTheme = foundation.getResolvedTheme();
  const css = useMemo(foundation.getCssStyles, [
    foundation,
    size,
    colorVariant,
    duration,
    borderRadius,
    brightness,
    saturation,
    hueRange,
    staticColors,
    resolvedTheme,
    data.current.detectedRadius,
  ]);
  const driver = useMemo(foundation.getDriverConfig, [
    foundation,
    size,
    resolvedTheme,
    duration,
    hueRange,
    staticColors,
    colorVariant,
  ]);
  useLayoutEffect(() => {
    connected.current = true;
    generation.current++;
    foundation.mountRadius();
    foundation.mountIntersection();
    return () => {
      connected.current = false;
      generation.current++;
      foundation.disposeFlow();
      foundation.disposeIntersection();
      foundation.disposeScale();
      foundation.disposeStyle();
      foundation.disposePulse();
    };
  }, [foundation]);
  useLayoutEffect(() => foundation.syncActive(active), [foundation, active]);
  useLayoutEffect(foundation.syncSize, [foundation, size]);
  useLayoutEffect(() => foundation.syncCss(css), [foundation, css]);
  useLayoutEffect(foundation.syncPulse, [
    foundation,
    driver,
    data.current.isActive,
    data.current.isFading,
    data.current.isVisible,
    preferences.reducedMotion,
  ]);
  useLayoutEffect(
    () => foundation.syncReducedMotion(preferences.reducedMotion),
    [foundation, preferences.reducedMotion],
  );
  useImperativeHandle(ref, () => ({ flowFrom: foundation.flowFrom }), [foundation]);
  const {
    isActive,
    isFading,
    isVisible,
    isFlowing,
    flowKey,
    flowBox,
    flowPoint,
    flowRadius,
    flowSeed,
  } = data.current;
  const flowColors = foundation.getFlowColors();
  const flowDisplacement = foundation.getFlowDisplacement();
  const finalBorderRadius = foundation.getFinalBorderRadius();
  return (
    <div
      data-beam={id}
      data-active={isActive && !isFading ? '' : undefined}
      data-fading={isFading ? '' : undefined}
      data-flowing={isFlowing ? '' : undefined}
      data-paused={isActive && !isFading && !isVisible ? '' : undefined}
      {...attrs}
      ref={wrapper}
      className={[prefix, className].filter(Boolean).join(' ')}
      style={{ ...foundation.getMergedStyle(), ...style } as CSSProperties}
      onAnimationEnd={(event) => {
        foundation.handleAnimationEnd(event.nativeEvent);
        onAnimationEnd?.(event);
      }}
    >
      {children}
      <div data-beam-bloom="" />
      {isFlowing && (
        <svg
          key={flowKey}
          data-beam-flow=""
          viewBox={`0 0 ${flowBox.width} ${flowBox.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          onAnimationEnd={(event) => {
            event.stopPropagation();
            foundation.handleFlowAnimationEnd();
          }}
        >
          <defs>
            <filter
              id={`${id}-flow-warp`}
              x="-24%"
              y="-24%"
              width="148%"
              height="148%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.026"
                seed={flowSeed}
                numOctaves="2"
                result="flow-noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="flow-noise"
                scale={flowDisplacement}
                xChannelSelector="R"
                yChannelSelector="G"
                result="flow-displaced"
              />
              <feGaussianBlur in="flow-displaced" stdDeviation="1.1" result="flow-soft" />
              <feColorMatrix in="flow-soft" type="saturate" values="1.24" />
            </filter>
            <radialGradient
              id={`${id}-flow-fill`}
              gradientUnits="userSpaceOnUse"
              cx={flowPoint.x}
              cy={flowPoint.y}
              r={flowRadius}
            >
              <stop offset="0" stopColor={flowColors.core} stopOpacity="0.5" />
              <stop offset="0.18" stopColor={flowColors.mist} stopOpacity="0.42" />
              <stop offset="0.46" stopColor={flowColors.accent} stopOpacity="0.32" />
              <stop offset="0.76" stopColor={flowColors.edge} stopOpacity="0.18" />
              <stop offset="1" stopColor={flowColors.edge} stopOpacity="0" />
            </radialGradient>
            <mask
              id={`${id}-flow-mask`}
              maskUnits="userSpaceOnUse"
              x={-flowRadius}
              y={-flowRadius}
              width={flowBox.width + flowRadius * 2}
              height={flowBox.height + flowRadius * 2}
            >
              <g filter={`url(#${id}-flow-warp)`}>
                <circle data-beam-flow-blob="" cx={flowPoint.x} cy={flowPoint.y} r={flowRadius} />
                <circle
                  data-beam-flow-blob="shore-a"
                  cx={flowPoint.x}
                  cy={flowPoint.y}
                  r={flowRadius * 0.72}
                />
                <circle
                  data-beam-flow-blob="shore-b"
                  cx={flowPoint.x}
                  cy={flowPoint.y}
                  r={flowRadius * 0.56}
                />
              </g>
            </mask>
          </defs>
          <rect
            data-beam-flow-sheet=""
            x="0"
            y="0"
            width={flowBox.width}
            height={flowBox.height}
            rx={finalBorderRadius}
            fill={`url(#${id}-flow-fill)`}
            mask={`url(#${id}-flow-mask)`}
          />
          <g filter={`url(#${id}-flow-warp)`}>
            <circle
              data-beam-flow-front=""
              cx={flowPoint.x}
              cy={flowPoint.y}
              r={flowRadius}
              fill="none"
              stroke={flowColors.front}
              strokeWidth={Math.max(18, flowRadius * 0.1)}
            />
            <circle
              data-beam-flow-front="highlight"
              cx={flowPoint.x}
              cy={flowPoint.y}
              r={flowRadius * 0.94}
              fill="none"
              stroke={flowColors.specular}
              strokeWidth={Math.max(8, flowRadius * 0.035)}
            />
          </g>
          <circle
            data-beam-flow-specular=""
            cx={flowPoint.x}
            cy={flowPoint.y}
            r={Math.max(16, flowRadius * 0.18)}
            fill={flowColors.specular}
          />
        </svg>
      )}
    </div>
  );
}
export default BorderBeam;
