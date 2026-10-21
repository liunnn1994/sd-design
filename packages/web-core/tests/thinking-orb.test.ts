import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import type { ThinkingOrbState } from '../dist/thinking-orb/types.js';

import { createThemeModeFoundation, type ThemeMode } from '../dist/config-provider/theme-mode.js';
import { paint } from '../dist/thinking-orb/engine/core.js';
import { BASE_PROFILES, scaleCounts, scaleRadii } from '../dist/thinking-orb/engine/profiles.js';
import { MODE_DRAWS } from '../dist/thinking-orb/engine/registry.js';
import {
  createThinkingOrbFoundation,
  resolveThinkingOrbDark,
  resolveThinkingOrbSize,
  type ThinkingOrbFoundationState,
} from '../dist/thinking-orb/foundation.js';
import { STATE_TO_MODE, resolvePreset } from '../dist/thinking-orb/presets.js';

function drawingContext() {
  const calls: unknown[][] = [];
  const context = {
    set fillStyle(value: unknown) {
      calls.push(['fillStyle', value]);
    },
    set strokeStyle(value: unknown) {
      calls.push(['strokeStyle', value]);
    },
    set lineWidth(value: unknown) {
      calls.push(['lineWidth', value]);
    },
    beginPath() {
      calls.push(['begin']);
    },
    fill() {
      calls.push(['fill']);
    },
    stroke() {
      calls.push(['stroke']);
    },
    arc(...args: number[]) {
      assert.ok(args.every(Number.isFinite));
      assert.ok(args[2] >= 0);
      calls.push(['arc', ...args]);
    },
    moveTo(...args: number[]) {
      assert.ok(args.every(Number.isFinite));
      calls.push(['moveTo', ...args]);
    },
    lineTo(...args: number[]) {
      assert.ok(args.every(Number.isFinite));
      calls.push(['lineTo', ...args]);
    },
    setTransform(...args: number[]) {
      calls.push(['transform', ...args]);
    },
    clearRect(...args: number[]) {
      calls.push(['clear', ...args]);
    },
  } as unknown as CanvasRenderingContext2D;
  return { context, calls };
}
function globalValue(t: TestContext, name: string, value: unknown) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, value });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  });
}
function fixture(t: TestContext, intersection = true) {
  const drawing = drawingContext(),
    frames = new Map<number, FrameRequestCallback>(),
    cancellations: number[] = [],
    visibilityListeners = new Set<() => void>(),
    mediaListeners = new Set<() => void>();
  const events: string[] = [],
    props = { state: 'working' as ThinkingOrbState, speed: 1, paused: false },
    media = {
      matches: false,
      addEventListener(_type: string, fn: () => void) {
        mediaListeners.add(fn);
      },
      removeEventListener(_type: string, fn: () => void) {
        mediaListeners.delete(fn);
      },
    },
    win = {
      devicePixelRatio: 3,
      matchMedia(query: string) {
        assert.equal(query, '(prefers-reduced-motion: reduce)');
        return media;
      },
    };
  let visibility: DocumentVisibilityState = 'visible',
    now = 2500,
    id = 0;
  const observers: {
    callback: IntersectionObserverCallback;
    observed: unknown;
    disconnected: boolean;
  }[] = [];
  class Observer {
    entry: { callback: IntersectionObserverCallback; observed: unknown; disconnected: boolean };
    constructor(callback: IntersectionObserverCallback) {
      this.entry = { callback, observed: undefined, disconnected: false };
      observers.push(this.entry);
    }
    observe(target: Element) {
      this.entry.observed = target;
      events.push('observe');
    }
    disconnect() {
      this.entry.disconnected = true;
      events.push('disconnect');
    }
  }
  globalValue(t, 'window', win);
  globalValue(t, 'document', {
    get visibilityState() {
      return visibility;
    },
    addEventListener(type: string, fn: () => void) {
      assert.equal(type, 'visibilitychange');
      visibilityListeners.add(fn);
    },
    removeEventListener(type: string, fn: () => void) {
      assert.equal(type, 'visibilitychange');
      visibilityListeners.delete(fn);
    },
  });
  globalValue(t, 'requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  globalValue(t, 'cancelAnimationFrame', (value: number) => {
    cancellations.push(value);
    frames.delete(value);
  });
  globalValue(t, 'IntersectionObserver', intersection ? Observer : undefined);
  t.mock.method(performance, 'now', () => now);
  const canvas = {
    width: 0,
    height: 0,
    getContext(kind: string) {
      assert.equal(kind, '2d');
      events.push('context');
      return drawing.context;
    },
  } as unknown as HTMLCanvasElement;
  const state: ThinkingOrbFoundationState = {
    props,
    canvas,
    resolvedSize: 64,
    isDark: false,
    reducedMotion: false,
  };
  const foundation = createThinkingOrbFoundation(state);
  return {
    state,
    props,
    win,
    media,
    mediaListeners,
    visibilityListeners,
    frames,
    cancellations,
    events,
    observers,
    drawing,
    canvas,
    foundation,
    set visibility(value: DocumentVisibilityState) {
      visibility = value;
      for (const fn of visibilityListeners) fn();
    },
    set now(value: number) {
      now = value;
    },
    intersect(value: boolean | undefined) {
      const obs = observers.at(-1)!;
      obs.callback(
        value === undefined ? [] : [{ isIntersecting: value } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    },
    frame() {
      const [frameId, callback] = frames.entries().next().value!;
      frames.delete(frameId);
      callback(now);
    },
  };
}

test('size clamp and explicit theme retain short-circuit inheritance reads', () => {
  for (const size of [20, 64]) assert.equal(resolveThinkingOrbSize(size), size);
  for (const size of [undefined, null, 0, 21, '20', 128])
    assert.equal(resolveThinkingOrbSize(size), 64);
  let reads = 0;
  const inherited = () => {
    reads++;
    return 'dark' as const;
  };
  assert.equal(resolveThinkingOrbDark('light', inherited), false);
  assert.equal(resolveThinkingOrbDark('dark', inherited), true);
  assert.equal(reads, 0);
  assert.equal(resolveThinkingOrbDark('auto', inherited), true);
  assert.equal(reads, 1);
});
test('preset registry retains all nine states, shared ring painter and cache identity', () => {
  assert.equal(Object.keys(STATE_TO_MODE).length, 9);
  assert.equal(MODE_DRAWS.ring, MODE_DRAWS.ribbon);
  for (const state of Object.keys(STATE_TO_MODE) as ThinkingOrbState[])
    for (const size of [20, 64] as const) {
      const preset = resolvePreset(state, size);
      assert.equal(preset, resolvePreset(state, size));
      assert.equal(preset.mode, STATE_TO_MODE[state]);
      assert.equal(typeof MODE_DRAWS[preset.mode], 'function');
      assert.ok(Number.isFinite(preset.speed));
      assert.notEqual(preset.opts, BASE_PROFILES[preset.mode]);
    }
});
test('count/radius scaling preserves inactive layers and original profiles', () => {
  const original = {
    rings: 10,
    lonDensity: 20,
    orbitN: 0,
    ghostN: 0,
    nodeN: 10,
    iconD: 0.1,
    rBase: 2,
    rDepth: 4,
    rSizeMul: 3,
  };
  const count = scaleCounts(original, 0.25);
  assert.equal(count.rings, 5);
  assert.equal(count.lonDensity, 10);
  assert.equal(count.orbitN, 0);
  assert.equal(count.ghostN, 0);
  assert.equal(count.nodeN, 3);
  assert.equal(count.iconD, 0.025);
  const radii = scaleRadii(original, 2);
  assert.equal(radii.rBase, 4);
  assert.equal(radii.rDepth, 8);
  assert.equal(radii.rSizeMul, 6);
  assert.equal(original.rBase, 2);
  assert.equal(original.nodeN, 10);
});
test('all mode/size/theme painters keep finite geometry across negative and static phases', () => {
  for (const state of Object.keys(STATE_TO_MODE) as ThinkingOrbState[])
    for (const size of [20, 64] as const)
      for (const dark of [false, true])
        for (const phase of [-10, -0.1, 0.6]) {
          const f = drawingContext(),
            preset = resolvePreset(state, size);
          MODE_DRAWS[preset.mode](f.context, size, phase, dark, preset.opts);
          assert.ok(f.calls.some((call) => call[0] === 'arc'));
        }
});
test('ink inversion precedes rasterization and depth sorting does not change input dot values', () => {
  for (const dark of [false, true]) {
    const f = drawingContext(),
      dots = [
        { x: 1, y: 1, z: 2, r: 1, white: 0.8 },
        { x: 0, y: 0, z: 0, r: 1, white: 0.2 },
      ];
    paint(f.context, dots, dark);
    assert.deepEqual(
      f.calls.filter((c) => c[0] === 'fillStyle').map((c) => c[1]),
      dark
        ? ['rgba(204,204,204,1)', 'rgba(51,51,51,1)']
        : ['rgba(51,51,51,1)', 'rgba(204,204,204,1)'],
    );
    assert.deepEqual(
      dots.map((d) => d.z),
      [0, 2],
    );
  }
});
test('paused renderer sets capped backing dimensions and draws the deterministic 0.6 frame', (t) => {
  const f = fixture(t);
  f.props.paused = true;
  f.foundation.setupRenderer();
  assert.equal(f.canvas.width, 128);
  assert.equal(f.canvas.height, 128);
  assert.deepEqual(f.drawing.calls.slice(0, 2), [
    ['transform', 2, 0, 0, 2, 0, 0],
    ['clear', 0, 0, 64, 64],
  ]);
  const expected = drawingContext(),
    preset = resolvePreset('working', 64);
  MODE_DRAWS[preset.mode](expected.context, 64, 0.6, false, preset.opts);
  assert.deepEqual(f.drawing.calls.slice(2), expected.calls);
  f.intersect(true);
  assert.equal(f.frames.size, 0);
  f.foundation.dispose();
  assert.equal(f.visibilityListeners.size, 0);
  assert.equal(f.observers[0].disconnected, true);
});
test('reduced motion draws a static frame without RAF, observers or visibility listeners', (t) => {
  const f = fixture(t);
  f.state.reducedMotion = true;
  f.foundation.setupRenderer();
  assert.equal(f.frames.size, 0);
  assert.equal(f.observers.length, 0);
  assert.equal(f.visibilityListeners.size, 0);
  assert.ok(f.drawing.calls.some((c) => c[0] === 'arc'));
  f.foundation.dispose();
});
test('visible intersection starts once, each frame uses the scaled clock and leaving cancels', (t) => {
  const f = fixture(t);
  f.props.speed = -2;
  f.foundation.setupRenderer();
  assert.equal(f.frames.size, 0);
  f.intersect(true);
  f.intersect(true);
  assert.equal(f.frames.size, 1);
  f.drawing.calls.length = 0;
  f.now = 5000;
  f.frame();
  const expected = drawingContext(),
    preset = resolvePreset('working', 64);
  MODE_DRAWS[preset.mode](
    expected.context,
    64,
    (5000 / 1000) * (preset.speed * -2),
    false,
    preset.opts,
  );
  assert.deepEqual(f.drawing.calls.slice(2), expected.calls);
  assert.equal(f.frames.size, 1);
  f.intersect(false);
  assert.equal(f.frames.size, 0);
  f.intersect(undefined);
  assert.equal(f.frames.size, 0);
  f.foundation.dispose();
});
test('hidden document guards observer and fallback start and resumes only when visible', (t) => {
  const f = fixture(t, false);
  f.visibility = 'hidden';
  f.foundation.setupRenderer();
  assert.equal(f.frames.size, 0);
  f.visibility = 'visible';
  assert.equal(f.frames.size, 1);
  f.visibility = 'hidden';
  assert.equal(f.frames.size, 0);
  f.foundation.dispose();
  assert.equal(f.visibilityListeners.size, 0);
});
test('visibility restoration cannot restart an offscreen observer-owned renderer', (t) => {
  const f = fixture(t);
  f.foundation.setupRenderer();
  f.intersect(true);
  f.visibility = 'hidden';
  assert.equal(f.frames.size, 0);
  f.intersect(false);
  f.visibility = 'visible';
  assert.equal(f.frames.size, 0);
  f.intersect(true);
  assert.equal(f.frames.size, 1);
  f.foundation.dispose();
});
test('renderer replacement cancels/disconnects before resizing and latest theme is read per frame', (t) => {
  const f = fixture(t);
  f.foundation.setupRenderer();
  f.intersect(true);
  f.events.length = 0;
  f.props.state = 'searching';
  Object.assign(f.state, { resolvedSize: 20 });
  f.win.devicePixelRatio = 1.5;
  f.foundation.setupRenderer();
  assert.deepEqual(f.events, ['disconnect', 'context', 'observe']);
  assert.equal(f.canvas.width, 30);
  assert.equal(f.observers[0].disconnected, true);
  assert.equal(f.visibilityListeners.size, 1);
  f.intersect(true);
  Object.assign(f.state, { isDark: true });
  f.drawing.calls.length = 0;
  f.frame();
  const expected = drawingContext(),
    preset = resolvePreset('searching', 20);
  MODE_DRAWS[preset.mode](expected.context, 20, 2.5 * preset.speed, true, preset.opts);
  assert.deepEqual(f.drawing.calls.slice(2), expected.calls);
  f.foundation.dispose();
  assert.equal(f.frames.size, 0);
});
test('missing canvas or context releases the previous renderer without new subscriptions', (t) => {
  const f = fixture(t);
  f.foundation.setupRenderer();
  f.intersect(true);
  Object.assign(f.state, { canvas: null });
  f.foundation.setupRenderer();
  assert.equal(f.frames.size, 0);
  assert.equal(f.visibilityListeners.size, 0);
  assert.equal(f.observers[0].disconnected, true);
  Object.assign(f.state, { canvas: { width: 0, height: 0, getContext: () => null } });
  f.foundation.setupRenderer();
  assert.equal(f.observers.length, 1);
  assert.equal(f.visibilityListeners.size, 0);
  f.foundation.dispose();
});
test('zero DPR falls back to one and static media changes publish current matches and unsubscribe', (t) => {
  const f = fixture(t);
  f.win.devicePixelRatio = 0;
  f.props.paused = true;
  f.foundation.setupRenderer();
  assert.equal(f.canvas.width, 64);
  f.foundation.setupReducedMotion();
  assert.equal(f.mediaListeners.size, 1);
  assert.equal(f.state.reducedMotion, false);
  f.media.matches = true;
  for (const fn of f.mediaListeners) fn();
  assert.equal(f.state.reducedMotion, true);
  f.media.matches = false;
  for (const fn of f.mediaListeners) fn();
  assert.equal(f.state.reducedMotion, false);
  f.foundation.dispose();
  assert.equal(f.mediaListeners.size, 0);
  assert.equal(f.visibilityListeners.size, 0);
});
test('theme resolution follows closest sd-theme and leaves state intact for detached targets', (t) => {
  globalValue(t, 'document', {});
  let theme = 'dark',
    selector = '',
    reads = 0;
  const target = {
    closest(value: string) {
      selector = value;
      reads++;
      return {
        getAttribute: (name: string) => {
          assert.equal(name, 'sd-theme');
          return theme;
        },
      };
    },
  } as unknown as HTMLElement;
  const state = { target: target as HTMLElement | null, mode: 'light' as ThemeMode };
  const f = createThemeModeFoundation(state);
  f.resolveTheme();
  assert.equal(state.mode, 'dark');
  assert.equal(selector, '[sd-theme]');
  theme = 'anything';
  f.resolveTheme();
  assert.equal(state.mode, 'light');
  state.target = null;
  f.resolveTheme();
  assert.equal(reads, 2);
});
test('theme mutation batch resolves once only for a matching attribute', (t) => {
  globalValue(t, 'document', {});
  let reads = 0;
  const state = {
    target: {
      closest() {
        reads++;
        return null;
      },
    } as unknown as HTMLElement,
    mode: 'dark' as ThemeMode,
  };
  const f = createThemeModeFoundation(state);
  f.handleMutations([
    { type: 'childList', attributeName: 'sd-theme' },
    { type: 'attributes', attributeName: 'class' },
  ] as MutationRecord[]);
  assert.equal(reads, 0);
  f.handleMutations([
    { type: 'attributes', attributeName: 'sd-theme' },
    { type: 'attributes', attributeName: 'sd-theme' },
  ] as MutationRecord[]);
  assert.equal(reads, 1);
  assert.equal(state.mode, 'light');
});
test('theme driver is inert without document even if a target could resolve', (t) => {
  globalValue(t, 'document', undefined);
  let reads = 0;
  const state = {
    get target() {
      reads++;
      return null;
    },
    mode: 'light' as ThemeMode,
  };
  createThemeModeFoundation(state).resolveTheme();
  assert.equal(reads, 0);
});
