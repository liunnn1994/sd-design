import type { ThinkingOrbProps as CoreProps } from '@sdata/web-core/thinking-orb/types';
import type { ComponentPropsWithRef } from 'react';

import {
  createThinkingOrbFoundation,
  resolveThinkingOrbSize,
  resolveThinkingOrbDark,
} from '@sdata/web-core/thinking-orb/foundation';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { useThemeMode } from '../_shared/use-theme-mode.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
export type {
  ThinkingOrbState,
  ThinkingOrbSize,
  ThinkingOrbTheme,
} from '@sdata/web-core/thinking-orb/types';
export type ThinkingOrbInstance = HTMLCanvasElement;
export interface ThinkingOrbProps extends CoreProps, ComponentPropsWithRef<'canvas'> {}
export function ThinkingOrb({
  state = 'working',
  size = 64,
  theme = 'auto',
  speed = 1,
  paused = false,
  ref,
  className,
  style,
  ...attrs
}: ThinkingOrbProps) {
  const prefix = usePrefix('thinking-orb');
  const { t } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const inherited = useThemeMode(canvas);
  const resolvedSize = resolveThinkingOrbSize(size);
  const isDark = resolveThinkingOrbDark(theme, () => inherited);
  const [reducedMotion, setReducedMotion] = useState(false);
  const reduced = useRef(false);
  const live = useRef({ state, speed, paused, resolvedSize, isDark });
  live.current = { state, speed, paused, resolvedSize, isDark };
  const [foundation] = useState(() =>
    createThinkingOrbFoundation({
      get props() {
        return live.current;
      },
      get canvas() {
        return canvas.current;
      },
      get resolvedSize() {
        return live.current.resolvedSize;
      },
      get isDark() {
        return live.current.isDark;
      },
      get reducedMotion() {
        return reduced.current;
      },
      set reducedMotion(value) {
        reduced.current = value;
        setReducedMotion(value);
      },
    }),
  );
  useLayoutEffect(() => {
    foundation.setupReducedMotion();
    return () => foundation.dispose();
  }, [foundation]);
  useLayoutEffect(
    () => foundation.setupRenderer(),
    [foundation, state, resolvedSize, speed, paused, isDark, reducedMotion],
  );
  useImperativeHandle(ref, () => canvas.current!, []);
  return (
    <canvas
      role="img"
      aria-label={t(`a11y.thinkingOrb.${state}`)}
      data-theme={isDark ? 'dark' : 'light'}
      data-state={state}
      {...attrs}
      ref={canvas}
      className={[prefix, className].filter(Boolean).join(' ')}
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
    />
  );
}
export default ThinkingOrb;
