import type { ThinkingOrbSize, ThinkingOrbState, ThinkingOrbTheme } from './types.js';

import { MODE_DRAWS } from './engine/registry.js';
import { resolvePreset } from './presets.js';
export function resolveThinkingOrbSize(size: unknown): ThinkingOrbSize {
  return size === 20 || size === 64 ? size : 64;
}
export function resolveThinkingOrbDark(
  theme: ThinkingOrbTheme,
  getInheritedTheme: () => 'light' | 'dark',
) {
  return theme === 'auto' ? getInheritedTheme() === 'dark' : theme === 'dark';
}
export interface ThinkingOrbFoundationState {
  readonly props: {
    readonly state: ThinkingOrbState;
    readonly speed: number;
    readonly paused: boolean;
  };
  readonly canvas: HTMLCanvasElement | null;
  readonly resolvedSize: ThinkingOrbSize;
  readonly isDark: boolean;
  reducedMotion: boolean;
}
export function createThinkingOrbFoundation(state: ThinkingOrbFoundationState) {
  let stopRenderer: (() => void) | undefined;
  let stopReducedMotion: (() => void) | undefined;

  function setupRenderer() {
    stopRenderer?.();
    stopRenderer = undefined;

    const canvas = state.canvas;
    if (!canvas) return;

    // A deterministic phase used whenever the orb is static: reduced-motion
    // users, and the single frame drawn while paused. Without this a paused
    // orb would freeze on a non-deterministic wall-clock snapshot.
    const representativePhase = 0.6;
    const sz = state.resolvedSize;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(sz * dpr);
    canvas.height = Math.round(sz * dpr);

    const context = canvas.getContext('2d');
    if (!context) return;

    const { mode, speed: presetSpeed, opts } = resolvePreset(state.props.state, sz);
    const draw = MODE_DRAWS[mode];
    const effectiveSpeed = presetSpeed * state.props.speed;

    const drawFrame = (time: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, sz, sz);
      draw(context, sz, time, state.isDark, opts);
    };

    if (state.reducedMotion) {
      drawFrame(representativePhase);
      return;
    }

    let animationFrame = 0;
    let running = false;
    let visible = true;

    const loop = () => {
      drawFrame((performance.now() / 1000) * effectiveSpeed);
      if (running) animationFrame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || state.props.paused || document.visibilityState === 'hidden') return;
      running = true;
      animationFrame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animationFrame);
    };

    drawFrame(
      state.props.paused ? representativePhase : (performance.now() / 1000) * effectiveSpeed,
    );

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? false;
            if (visible && document.visibilityState !== 'hidden') start();
            else stop();
          });
    observer?.observe(canvas);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!observer) start();

    stopRenderer = () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  function setupReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      state.reducedMotion = mediaQuery.matches;
    };
    update();
    mediaQuery.addEventListener('change', update);
    stopReducedMotion = () => mediaQuery.removeEventListener('change', update);
  }

  function dispose() {
    stopRenderer?.();
    stopReducedMotion?.();
  }
  return { setupRenderer, setupReducedMotion, dispose };
}
