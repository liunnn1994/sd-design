import type {
  LiquidGlassLogoProps as CoreProps,
  LiquidGlassLogoExposed,
} from '@sdata/web-core/liquid-glass-logo/types';
import type { ComponentPropsWithRef, CSSProperties, ReactNode, Ref } from 'react';

import { createLiquidGlassLogoController } from '@sdata/web-core/liquid-glass-logo/controller';
import { resolveLiquidGlassLogo } from '@sdata/web-core/liquid-glass-logo/foundation';
import { getLiquidGlassLogoFallbackTheme } from '@sdata/web-core/liquid-glass-logo/theme';
import { useContext, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useBeamPreferences } from '../_shared/use-beam-preferences.js';
import { useThemeMode } from '../_shared/use-theme-mode.js';
import { usePrefix } from '../config-provider/index.js';
import { ThemeContext } from '../config-provider/theme-provider.js';
export type { LiquidGlassLogoExposed } from '@sdata/web-core/liquid-glass-logo/types';
export type { LiquidGlassLogoTuning } from '@sdata/web-core/liquid-glass-logo/types';
export {
  liquidGlassLogoDefaults,
  liquidGlassLogoDuration,
  liquidGlassLogoThemes,
  liquidGlassLogoNoteLogo,
  liquidGlassLogoReferenceMark,
} from '@sdata/web-core/liquid-glass-logo/foundation';
export type LiquidGlassLogoInstance = LiquidGlassLogoExposed;
export interface LiquidGlassLogoProps
  extends CoreProps, Omit<ComponentPropsWithRef<'div'>, 'ref' | 'onError' | 'children'> {
  ref?: Ref<LiquidGlassLogoExposed>;
  fallback?: ReactNode;
  onReady?: () => void;
  onError?: (error: Error) => void;
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export function LiquidGlassLogo({
  logo,
  mark,
  text,
  ending,
  logoSize,
  logoScale,
  finalLogoScale,
  tile,
  fontSize,
  fontFamily,
  fontWeight,
  fontStretch,
  letterSpacing,
  markGap,
  logoColor,
  logoRelief,
  textColor,
  tileColor,
  background,
  depth,
  dispersion,
  relief,
  caustics,
  highlights,
  bloom,
  dropSize,
  dropStrength,
  echoTint,
  innerWallFocus,
  decay,
  speed,
  loop,
  loopDelay,
  paused,
  maxDpr,
  theme = 'auto',
  autoWidth = true,
  height,
  backgroundImage,
  backgroundX = 0,
  backgroundY = 0,
  backgroundScale = 1,
  backgroundTint = '#000000',
  backgroundTintOpacity = 0,
  ref,
  fallback: fallbackContent,
  onReady,
  onError,
  className,
  style,
  ...attrs
}: LiquidGlassLogoProps) {
  const prefix = usePrefix('liquid-glass-logo');
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const library = useContext(ThemeContext);
  const preferences = useBeamPreferences();
  const inherited = useThemeMode(root, () =>
    getLiquidGlassLogoFallbackTheme(root.current, library.mode, preferences.systemTheme === 'dark'),
  );
  const resolvedTheme = theme === 'auto' ? inherited : theme;
  const tuning = useMemo(
    () =>
      resolveLiquidGlassLogo(
        {
          logo,
          mark,
          text,
          ending,
          logoSize,
          logoScale,
          finalLogoScale,
          tile,
          fontSize,
          fontFamily,
          fontWeight,
          fontStretch,
          letterSpacing,
          markGap,
          logoColor,
          logoRelief,
          textColor,
          tileColor,
          background,
          depth,
          dispersion,
          relief,
          caustics,
          highlights,
          bloom,
          dropSize,
          dropStrength,
          echoTint,
          innerWallFocus,
          decay,
          speed,
          loop,
          loopDelay,
          paused,
          maxDpr,
          theme: resolvedTheme,
        },
        Boolean(backgroundImage),
      ),
    [
      logo,
      mark,
      text,
      ending,
      logoSize,
      logoScale,
      finalLogoScale,
      tile,
      fontSize,
      fontFamily,
      fontWeight,
      fontStretch,
      letterSpacing,
      markGap,
      logoColor,
      logoRelief,
      textColor,
      tileColor,
      background,
      depth,
      dispersion,
      relief,
      caustics,
      highlights,
      bloom,
      dropSize,
      dropStrength,
      echoTint,
      innerWallFocus,
      decay,
      speed,
      loop,
      loopDelay,
      paused,
      maxDpr,
      resolvedTheme,
      backgroundImage,
      height,
      autoWidth,
      backgroundX,
      backgroundY,
      backgroundScale,
      backgroundTint,
      backgroundTintOpacity,
    ],
  );
  const [measured, setMeasured] = useState<{ width?: number; scale: number }>({ scale: 1 });
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const live = useRef({ tuning, autoWidth, onReady, onError });
  live.current = { tuning, autoWidth, onReady, onError };
  const controller = useRef<ReturnType<typeof createLiquidGlassLogoController> | null>(null);
  useLayoutEffect(() => {
    let connected = true;
    setReady(false);
    setFallback(false);
    const current = createLiquidGlassLogoController({
      getElement: () => root.current,
      getCanvas: () => canvas.current,
      getTuning: () => live.current.tuning,
      isAutoWidth: () => live.current.autoWidth,
      onWidth: (width, scale) =>
        setMeasured((previous) =>
          previous.width === width && previous.scale === scale ? previous : { width, scale },
        ),
      onReady: () => {
        setReady(true);
        live.current.onReady?.();
      },
      onError: (error) => {
        // Discard synchronous setup failures from a discarded StrictMode connection.
        queueMicrotask(() => {
          if (!connected) return;
          setReady(false);
          setFallback(true);
          live.current.onError?.(error);
        });
      },
    });
    controller.current = current;
    current.connect();
    return () => {
      connected = false;
      current.dispose();
      controller.current = null;
    };
  }, []);
  useLayoutEffect(() => controller.current?.updateTuning(), [tuning]);
  useLayoutEffect(() => controller.current?.updateWidth(), [tuning, height, autoWidth]);
  useImperativeHandle(
    ref,
    () => ({
      replay: () => controller.current?.replay(),
      seek: (seconds) => controller.current?.seek(seconds),
      pause: () => controller.current?.pause(),
      play: () => controller.current?.play(),
    }),
    [],
  );
  const markSource = tuning.mark === 'logo' ? tuning.logo : tuning.mark;
  const logoEdge = tuning.logoSize * tuning.logoScale * tuning.finalLogoScale * measured.scale;
  return (
    <div
      role="img"
      aria-label={tuning.ending === 'logo' ? 'Logo' : tuning.text}
      data-liquid-glass-ready={ready || undefined}
      data-liquid-glass-fallback={fallback || undefined}
      data-liquid-glass-theme={tuning.theme}
      {...attrs}
      ref={root}
      className={[prefix, className].filter(Boolean).join(' ')}
      style={
        {
          height,
          background: tuning.background,
          [`--${prefix}-auto-width`]:
            measured.width === undefined ? undefined : `${measured.width}px`,
          ...style,
        } as CSSProperties
      }
    >
      {backgroundImage && (
        <>
          <div
            className={`${prefix}-background`}
            aria-hidden="true"
            style={{
              background: `url(${JSON.stringify(backgroundImage)}) center / cover no-repeat`,
              transform: `translate(${clamp(backgroundX, -100, 100)}%, ${clamp(backgroundY, -100, 100)}%) scale(${clamp(backgroundScale, 1, 3)})`,
            }}
          />
          <div
            className={`${prefix}-background`}
            aria-hidden="true"
            style={{ backgroundColor: backgroundTint, opacity: clamp(backgroundTintOpacity, 0, 1) }}
          />
        </>
      )}
      <canvas ref={canvas} aria-hidden="true" />
      {fallback && (
        <span
          className={`${prefix}-fallback`}
          aria-hidden="true"
          style={{
            color: tuning.textColor,
            fontFamily: tuning.fontFamily,
            fontWeight: tuning.fontWeight,
            fontStretch: tuning.fontStretch,
            fontSize: tuning.fontSize * measured.scale,
            letterSpacing: `${tuning.letterSpacing}em`,
            gap: `${tuning.markGap}em`,
          }}
        >
          {fallbackContent !== undefined ? (
            fallbackContent
          ) : tuning.ending === 'logo' ? (
            <img
              src={tuning.logo}
              alt=""
              className={`${prefix}-fallback-logo`}
              style={{ width: logoEdge, height: logoEdge }}
            />
          ) : (
            <>
              {markSource && <img src={markSource} alt="" />}
              {tuning.text}
            </>
          )}
        </span>
      )}
    </div>
  );
}
export default LiquidGlassLogo;
