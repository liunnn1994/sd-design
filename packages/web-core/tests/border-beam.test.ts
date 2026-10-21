import assert from 'node:assert/strict';
import { test } from 'node:test';

import { observeBeamPreferences } from '../dist/_utils/beam-preferences.js';
import {
  createBorderBeamFoundation,
  type BorderBeamState,
} from '../dist/border-beam/foundation.js';
import { registerPulseInstance } from '../dist/border-beam/pulseDriver.js';

function fixture(active = false) {
  const queue: (() => void)[] = [],
    events: string[] = [];
  const env = { wrapper: null as HTMLDivElement | null };
  let foundation!: ReturnType<typeof createBorderBeamFoundation>;
  const state: BorderBeamState = {
    id: 'bb-contract',
    props: {
      active,
      size: 'md',
      colorVariant: 'colorful',
      theme: 'dark',
      staticColors: false,
      hueRange: 30,
      strength: 1,
      density: 1,
    },
    get wrapper() {
      return env.wrapper;
    },
    isActive: false,
    isFading: false,
    isVisible: true,
    detectedRadius: null,
    pulseGlowScale: { x: 1, y: 1 },
    isFlowing: false,
    flowKey: 0,
    flowPoint: { x: 0, y: 0 },
    flowRadius: 0,
    flowBox: { width: 1, height: 1 },
    flowSeed: 1,
    systemTheme: 'dark',
    get resolvedTheme() {
      return foundation.getResolvedTheme();
    },
    get themeConfig() {
      return foundation.getThemeConfig();
    },
    get sizeConfig() {
      return foundation.getSizeConfig();
    },
    get isPulse() {
      return foundation.getIsPulse();
    },
    get finalBorderRadius() {
      return foundation.getFinalBorderRadius();
    },
    get finalDuration() {
      return foundation.getFinalDuration();
    },
    get finalSaturation() {
      return foundation.getFinalSaturation();
    },
    get finalBrightness() {
      return foundation.getFinalBrightness();
    },
    get finalHueRange() {
      return foundation.getFinalHueRange();
    },
    get finalStaticColors() {
      return foundation.getFinalStaticColors();
    },
    get cssStyles() {
      return foundation.getCssStyles();
    },
    get driverConfig() {
      return foundation.getDriverConfig();
    },
  };
  foundation = createBorderBeamFoundation(state, {
    afterRender(task) {
      queue.push(task);
    },
    activate() {
      events.push('activate');
    },
    deactivate() {
      events.push('deactivate');
    },
  });
  return { state, foundation, env, queue, events };
}
function globals(values: Record<string, unknown>, run: () => void) {
  const saved = new Map(
    Object.keys(values).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(globalThis, key, { value, configurable: true });
  try {
    run();
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}
function timerWindow(reduce = false) {
  let next = 1;
  const tasks = new Map<number, () => void>();
  const delays: number[] = [];
  const cleared: number[] = [];
  return {
    tasks,
    delays,
    cleared,
    window: {
      matchMedia() {
        return { matches: reduce };
      },
      setTimeout(task: () => void, delay: number) {
        const id = next++;
        tasks.set(id, task);
        delays.push(delay);
        return id;
      },
      clearTimeout(id: number) {
        tasks.delete(id);
        cleared.push(id);
      },
    },
  };
}
const rect = { width: 100, height: 50 };

test('BorderBeam constructs and derives CSS without DOM; initializes active from props', () => {
  const { state, foundation } = fixture(true);
  assert.equal(state.isActive, true);
  assert.equal(state.finalDuration, 1.96);
  assert.equal(state.finalBorderRadius, 16);
  assert.match(state.cssStyles, /bb-contract/);
  foundation.flowFrom();
  assert.equal(state.flowKey, 0);
  foundation.disposeFlow();
  foundation.disposeIntersection();
  foundation.disposeScale();
  foundation.disposeStyle();
  foundation.disposePulse();
  state.props.size = 'line';
  assert.equal(state.finalDuration, 3.1);
  assert.equal(state.finalHueRange, 13);
  state.props.colorVariant = 'mono';
  assert.equal(state.finalStaticColors, true);
  state.props.size = 'pulse-inner';
  assert.equal(state.finalDuration, 2.3);
  state.props.duration = 0;
  assert.equal(state.finalDuration, 0);
  state.props.borderRadius = 0;
  assert.equal(state.finalBorderRadius, 0);
});

test('BorderBeam flow preserves local coordinates, farthest corner radius, seed and timer reconciliation', () => {
  const timer = timerWindow();
  globals({ window: timer.window }, () => {
    const { state, foundation, env, events } = fixture();
    env.wrapper = { getBoundingClientRect: () => rect } as HTMLDivElement;
    foundation.flowFrom('center');
    assert.deepEqual(state.flowPoint, { x: 50, y: 25 });
    assert.equal(state.flowRadius, Math.hypot(50, 25) + 48);
    assert.equal(state.flowSeed, 292);
    assert.equal(state.flowKey, 1);
    assert.equal(state.isFlowing, true);
    assert.deepEqual(timer.delays, [760]);
    foundation.flowFrom({ x: -20, y: 60 });
    assert.deepEqual(state.flowPoint, { x: -20, y: 60 });
    assert.equal(state.flowKey, 2);
    assert.deepEqual(timer.cleared, [1]);
    assert.equal(timer.tasks.size, 1);
    foundation.handleFlowAnimationEnd();
    assert.equal(state.isFlowing, false);
    assert.equal(state.isFading, true);
    assert.deepEqual(events, []);
    assert.equal(timer.tasks.size, 0);
  });
});

test('BorderBeam presets and minimum box preserve the original fallback and coverage padding', () => {
  const timer = timerWindow();
  globals({ window: timer.window }, () => {
    const { state, foundation, env } = fixture(true);
    env.wrapper = { getBoundingClientRect: () => rect } as HTMLDivElement;
    for (const [coordinate, point] of [
      ['top-left', { x: 0, y: 0 }],
      ['top-right', { x: 100, y: 0 }],
      ['bottom-left', { x: 0, y: 50 }],
      ['bottom-right', { x: 100, y: 50 }],
    ] as const) {
      foundation.flowFrom(coordinate);
      assert.deepEqual(state.flowPoint, point);
      assert.equal(state.flowRadius, Math.hypot(100, 50) + 48);
    }
    env.wrapper = { getBoundingClientRect: () => ({ width: 0, height: 0 }) } as HTMLDivElement;
    foundation.flowFrom();
    assert.deepEqual(state.flowBox, { width: 1, height: 1 });
    foundation.disposeFlow();
    assert.equal(timer.tasks.size, 0);
  });
});

test('BorderBeam reduced flow finishes silently while active watcher deactivation notifies once', () => {
  const timer = timerWindow(true);
  globals({ window: timer.window }, () => {
    const { state, foundation, env, events } = fixture();
    env.wrapper = { getBoundingClientRect: () => rect } as HTMLDivElement;
    foundation.flowFrom();
    assert.equal(state.isActive, false);
    assert.equal(state.isFlowing, false);
    assert.equal(state.isFading, false);
    assert.deepEqual(events, []);
    assert.equal(timer.delays.length, 0);
    foundation.syncActive(true);
    foundation.syncActive(false);
    assert.deepEqual(events, ['deactivate']);
    foundation.syncActive(false);
    assert.equal(events.length, 1);
  });
});

test('BorderBeam animation callbacks reject pseudo-elements, child animation names and other instances', () => {
  const { state, foundation, events } = fixture(true);
  state.isFading = true;
  for (const event of [
    { animationName: 'beam-fade-out-bb-contract', pseudoElement: '::after' },
    { animationName: 'fade-in-up', pseudoElement: '' },
    { animationName: 'beam-fade-out-bb-other', pseudoElement: '' },
  ])
    foundation.handleAnimationEnd(event as AnimationEvent);
  assert.deepEqual(events, []);
  assert.equal(state.isFading, true);
  foundation.handleAnimationEnd({ animationName: 'beam-fade-in-bb-contract' } as AnimationEvent);
  foundation.handleAnimationEnd({ animationName: 'beam-fade-out-bb-contract' } as AnimationEvent);
  assert.deepEqual(events, ['activate', 'deactivate']);
  assert.equal(state.isActive, false);
  assert.equal(state.isFading, false);
});

test('BorderBeam resize generation invalidates deferred setup and clamps scale before observing the slot', () => {
  const observations: unknown[] = [],
    disconnects: unknown[] = [];
  class Resize {
    constructor(_callback: () => void) {}
    observe(child: unknown) {
      observations.push(child);
    }
    disconnect() {
      disconnects.push(this);
    }
  }
  globals({ ResizeObserver: Resize }, () => {
    const { state, foundation, env, queue } = fixture();
    state.props.size = 'pulse-outside';
    const child = {
      hasAttribute: () => false,
      getBoundingClientRect: () => ({ width: 700, height: 14 }),
    };
    env.wrapper = { children: [child] } as unknown as HTMLDivElement;
    foundation.mountScale();
    foundation.syncSize();
    queue.shift()!();
    assert.equal(observations.length, 0);
    queue.shift()!();
    assert.deepEqual(state.pulseGlowScale, { x: 2, y: 0.35 });
    assert.deepEqual(observations, [child]);
    foundation.syncSize();
    assert.equal(disconnects.length, 1);
    foundation.disposeScale();
    queue.shift()!();
    assert.equal(observations.length, 1);
  });
});

test('BorderBeam slot radius observer skips decorative nodes and reconnects only on child replacement', () => {
  const registrations: unknown[][] = [];
  let detect!: () => void;
  let disconnected = 0;
  class Mutation {
    constructor(callback: () => void) {
      detect = callback;
    }
    observe(...args: unknown[]) {
      registrations.push(args);
    }
    disconnect() {
      disconnected++;
    }
  }
  globals(
    { MutationObserver: Mutation, getComputedStyle: () => ({ borderTopLeftRadius: '12.5px' }) },
    () => {
      const { state, foundation, env, queue } = fixture();
      const decoration = { hasAttribute: (key: string) => key === 'data-beam-bloom' },
        child = { hasAttribute: () => false };
      const wrapper = { children: [decoration, child] };
      env.wrapper = wrapper as unknown as HTMLDivElement;
      foundation.mountRadius();
      queue.shift()!();
      assert.equal(state.detectedRadius, 12.5);
      assert.equal(registrations.length, 3);
      assert.equal(disconnected, 1);
      detect();
      assert.equal(registrations.length, 3);
      wrapper.children = [decoration];
      detect();
      assert.equal(state.detectedRadius, null);
      foundation.disposeFlow();
      assert.equal(disconnected, 3);
    },
  );
});

test('BorderBeam shared pulse loop is lazy, throttled, uses original units, and stops only after final unregister', () => {
  const frames = new Map<number, (time: number) => void>(),
    cancelled: number[] = [];
  let next = 0;
  globals(
    {
      requestAnimationFrame: (fn: (time: number) => void) => {
        const id = next++;
        frames.set(id, fn);
        return id;
      },
      cancelAnimationFrame: (id: number) => {
        cancelled.push(id);
        frames.delete(id);
      },
    },
    () => {
      const values: Record<string, string> = {};
      const el = {
        style: {
          setProperty(key: string, value: string) {
            values[key] = value;
          },
        },
      } as unknown as HTMLElement;
      const first = registerPulseInstance(el, {
        hue: null,
        oscillators: [{ prop: '--x', a: 0, b: 10, period: 2, delay: 0, unit: 'px' }],
      });
      const second = registerPulseInstance(el, { oscillators: [], hue: null });
      assert.equal(frames.size, 1);
      frames.get(0)!(500);
      assert.equal(values['--x'], '5.00px');
      first();
      assert.equal(cancelled.length, 0);
      second();
      assert.equal(cancelled.length, 1);
    },
  );
});

test('Beam preferences publish initial theme before motion and remove identical callbacks', () => {
  const events: unknown[] = [],
    added: unknown[] = [],
    removed: unknown[] = [];
  const queries = [
    {
      matches: false,
      addEventListener(_type: string, fn: () => void) {
        added.push(fn);
      },
      removeEventListener(_type: string, fn: () => void) {
        removed.push(fn);
      },
    },
    {
      matches: true,
      addEventListener(_type: string, fn: () => void) {
        added.push(fn);
      },
      removeEventListener(_type: string, fn: () => void) {
        removed.push(fn);
      },
    },
  ];
  let index = 0;
  globals(
    {
      window: {
        matchMedia() {
          return queries[index++];
        },
      },
    },
    () => {
      const stop = observeBeamPreferences({
        theme(value) {
          events.push(value);
        },
        motion(value) {
          events.push(value);
        },
      });
      assert.deepEqual(events, ['light', true]);
      stop();
      assert.deepEqual(removed, added);
    },
  );
});
