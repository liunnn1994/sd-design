import assert from 'node:assert/strict';
import { test } from 'node:test';

import { acquireAnalyser, getAudioContext, isAudioSupported } from '../dist/voice-glow/audio.js';
import {
  createVoiceGlowFoundation,
  supportsVoiceCanvasFilter,
  type VoiceGlowState,
} from '../dist/voice-glow/foundation.js';
import { createVoiceMicrophone, type VoiceMicrophoneData } from '../dist/voice-glow/microphone.js';
function fixture(active = false) {
  let foundation!: ReturnType<typeof createVoiceGlowFoundation>;
  const events: unknown[][] = [];
  const env = { wrapper: undefined as HTMLElement | undefined };
  const state: VoiceGlowState = {
    id: 'vg-contract',
    props: {
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
      active,
      paused: false,
      staticColors: false,
    },
    get wrapper() {
      return env.wrapper;
    },
    isActive: false,
    isFading: false,
    detectedRadius: 16,
    systemTheme: 'dark',
    reducedMotion: false,
    get resolvedTheme() {
      return foundation.getResolvedTheme();
    },
    get defaults() {
      return foundation.getDefaults();
    },
    get geometry() {
      return foundation.getGeometry();
    },
    get palette() {
      return foundation.getPalette();
    },
    get typeStyle() {
      return foundation.getTypeStyle();
    },
    get scale() {
      return foundation.getScale();
    },
    get coreLight() {
      return foundation.getCoreLight();
    },
    get distortion() {
      return foundation.getDistortion();
    },
    get distortionDetail() {
      return foundation.getDistortionDetail();
    },
    get radius() {
      return foundation.getRadius();
    },
    get bandColors() {
      return foundation.getBandColors();
    },
    get css() {
      return foundation.getCss();
    },
    get driverConfig() {
      return foundation.getDriverConfig();
    },
  };
  foundation = createVoiceGlowFoundation(state, {
    level(value) {
      events.push(['level', value]);
    },
    activate() {
      events.push(['activate']);
    },
    deactivate() {
      events.push(['deactivate']);
    },
  });
  return { state, foundation, events, env };
}
async function globals(values: Record<string, unknown>, run: () => void | Promise<void>) {
  const saved = new Map(
    Object.keys(values).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(globalThis, key, { value, configurable: true });
  try {
    await run();
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

test('VoiceGlow constructs without DOM and preserves defaults, opaque style, custom CSS and lazy level', () => {
  const { state, foundation } = fixture(true);
  assert.equal(state.isActive, true);
  assert.equal(supportsVoiceCanvasFilter(), true);
  assert.equal(state.resolvedTheme, 'dark');
  const style = { opaque: true };
  state.props.style = style;
  state.props.css = '[data-voice-beam="{id}"] { --test: 1; }';
  assert.match(state.css, /--test: 1/);
  assert.match(state.css, /vg-contract/);
  assert.equal(state.props.style, style);
  state.props.level = () => {
    throw Error('must stay lazy');
  };
  assert.equal(state.driverConfig.sensitivity, 3.1);
  foundation.connectDriver(() => {
    throw Error('no wrapper');
  });
});
test('VoiceGlow geometry copies defaults and retains explicit numeric zero and clamp rules', () => {
  const { state } = fixture();
  const defaults = state.defaults;
  state.props.scale = 0;
  state.props.flow = 0;
  state.props.glowWidth = 0;
  state.props.coreLight = 9;
  state.props.borderRadius = 0;
  assert.equal(state.scale, 0.05);
  assert.equal(state.geometry.flow, 0);
  assert.equal(state.geometry.glowWidth, 0);
  assert.equal(state.coreLight, 3);
  assert.equal(state.radius, 0);
  assert.notEqual(state.geometry, defaults);
  assert.notEqual(defaults.glowWidth, 0);
  state.props.colorVariant = 'mono';
  assert.equal(state.driverConfig.staticColors, true);
  state.props.hueRange = 0;
  assert.equal(state.driverConfig.hueRange, 0);
});
test('VoiceGlow uses original palette fallback and processing driver settings', () => {
  const { state } = fixture();
  state.props.theme = 'light';
  state.props.bandColors = { core: '#abc', above: 'unsupported' };
  assert.equal(state.bandColors.core, '170, 187, 204');
  assert.equal(state.bandColors.above, '255, 122, 182');
  state.props.processing = true;
  state.props.paused = true;
  assert.equal(state.driverConfig.processing, true);
  assert.equal(state.driverConfig.paused, true);
  assert.equal(state.driverConfig.theme, 'light');
  assert.equal(state.driverConfig.radius, 16);
});
test('VoiceGlow fade callbacks reject descendants and pseudo-elements before exact instance names', () => {
  const { state, foundation, env, events } = fixture(true);
  env.wrapper = {} as HTMLElement;
  foundation.syncActive(false);
  assert.equal(state.isFading, true);
  for (const event of [
    { target: {}, animationName: 'vb-fade-out-vg-contract' },
    { target: env.wrapper, pseudoElement: '::after', animationName: 'vb-fade-out-vg-contract' },
    { target: env.wrapper, animationName: 'vb-fade-out-other' },
  ])
    foundation.handleAnimationEnd(event as unknown as AnimationEvent);
  assert.deepEqual(events, []);
  foundation.syncActive(true);
  assert.equal(state.isFading, false);
  foundation.handleAnimationEnd({
    target: env.wrapper,
    animationName: 'vb-fade-in-vg-contract',
  } as unknown as AnimationEvent);
  foundation.handleAnimationEnd({
    target: env.wrapper,
    animationName: 'vb-fade-out-vg-contract',
  } as unknown as AnimationEvent);
  assert.deepEqual(events, [['activate'], ['deactivate']]);
  assert.equal(state.isActive, false);
});
test('VoiceGlow radius mount retains zero fallback and bloom-parent lookup', async () => {
  const { state, foundation, env } = fixture();
  const child = { hasAttribute: () => false },
    parent = {};
  env.wrapper = { firstElementChild: child, parentElement: parent } as unknown as HTMLElement;
  let source: unknown;
  await globals(
    {
      getComputedStyle: (element: unknown) => {
        source = element;
        return { borderTopLeftRadius: '0px' };
      },
    },
    () => {
      foundation.mountRadius();
      assert.equal(state.detectedRadius, 16);
      assert.equal(source, child);
      child.hasAttribute = () => true;
      foundation.mountRadius();
      assert.equal(source, parent);
    },
  );
});
test('VoiceGlow style node is inserted before wrapper, updated only after mount, removed on dispose', async () => {
  const { state, foundation, env } = fixture();
  let inserted: unknown;
  let removed = 0,
    created = 0;
  const element = {
    textContent: '',
    remove() {
      removed++;
    },
  };
  env.wrapper = {
    before(value: unknown) {
      inserted = value;
    },
  } as unknown as HTMLElement;
  await globals(
    {
      document: {
        createElement() {
          created++;
          return element;
        },
      },
    },
    () => {
      foundation.syncCss('ignored');
      assert.equal(created, 0);
      foundation.mountStyle();
      assert.equal(inserted, element);
      assert.equal(element.textContent, state.css);
      foundation.syncCss('updated');
      assert.equal(element.textContent, 'updated');
      foundation.disposeStyle();
      assert.equal(removed, 1);
    },
  );
});

const audioLog: unknown[][] = [];
class FakeAudioContext {
  state = 'running';
  resume() {
    audioLog.push(['resume']);
    return Promise.resolve();
  }
  createMediaStreamSource(stream: MediaStream) {
    audioLog.push(['source', stream]);
    return {
      connect(node: unknown) {
        audioLog.push(['connect', node]);
      },
      disconnect(node?: unknown) {
        audioLog.push(['disconnect', node]);
      },
    };
  }
  createAnalyser() {
    return {};
  }
}
function streamFixture() {
  let stopped = 0;
  const listeners: (() => void)[] = [];
  const track = {
    stop() {
      stopped++;
    },
    addEventListener(_type: string, listener: () => void) {
      listeners.push(listener);
    },
  };
  const stream = {
    getTracks: () => [track],
    getAudioTracks: () => [track],
  } as unknown as MediaStream;
  return {
    stream,
    get stopped() {
      return stopped;
    },
    end() {
      for (const listener of listeners) listener();
    },
  };
}
const data = (): VoiceMicrophoneData => ({ stream: null, state: 'unsupported', error: null });
function web(getUserMedia: (options: MediaStreamConstraints) => Promise<MediaStream>) {
  return {
    window: { AudioContext: FakeAudioContext },
    navigator: { mediaDevices: { getUserMedia } },
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test('Microphone unsupported construction and commands remain inert without browser globals', async () => {
  const state = data();
  const mic = createVoiceMicrophone(state);
  assert.equal(mic.supported, false);
  assert.equal(await mic.start(), null);
  mic.stop();
  assert.equal(state.state, 'unsupported');
  assert.equal(isAudioSupported(), false);
  assert.equal(getAudioContext(), null);
});
test('Voice audio leases share one source per stream and release each analyser exactly once', async () => {
  const { stream } = streamFixture();
  await globals(
    web(async () => stream),
    () => {
      const start = audioLog.length;
      const first = acquireAnalyser(stream)!,
        second = acquireAnalyser(stream)!;
      assert.ok(first && second);
      assert.notEqual(first.analyser, second.analyser);
      assert.equal(first.analyser.fftSize, 1024);
      assert.equal(first.analyser.smoothingTimeConstant, 0.5);
      assert.equal(audioLog.slice(start).filter((entry) => entry[0] === 'source').length, 1);
      first.release();
      first.release();
      assert.equal(audioLog.slice(start).filter((entry) => entry[0] === 'disconnect').length, 1);
      second.release();
      assert.equal(audioLog.slice(start).filter((entry) => entry[0] === 'disconnect').length, 3);
    },
  );
});
test('Microphone captures current constraints, publishes live, reuses stream, and clears on ended', async () => {
  const next = streamFixture(),
    state = data();
  const constraints: MediaStreamConstraints[] = [];
  await globals(
    web(async (value) => {
      constraints.push(value);
      return next.stream;
    }),
    async () => {
      const options = { constraints: { noiseSuppression: true } };
      const mic = createVoiceMicrophone(state, options);
      assert.equal(state.state, 'idle');
      assert.equal(await mic.start(), next.stream);
      assert.equal(state.state, 'live');
      assert.equal(await mic.start(), next.stream);
      assert.equal(constraints.length, 1);
      assert.deepEqual(constraints[0], {
        audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false },
      });
      next.end();
      assert.equal(state.stream, null);
      assert.equal(state.state, 'idle');
      mic.stop();
      assert.equal(next.stopped, 0);
    },
  );
});
test('Microphone superseded requests stop late streams and keep only latest accepted stream', async () => {
  const first = deferred<MediaStream>(),
    second = deferred<MediaStream>(),
    old = streamFixture(),
    latest = streamFixture(),
    state = data();
  let calls = 0;
  await globals(
    web(() => (++calls === 1 ? first.promise : second.promise)),
    async () => {
      const mic = createVoiceMicrophone(state);
      const oldRequest = mic.start(),
        newRequest = mic.start();
      assert.equal(state.state, 'requesting');
      first.resolve(old.stream);
      assert.equal(await oldRequest, null);
      assert.equal(old.stopped, 1);
      second.resolve(latest.stream);
      assert.equal(await newRequest, latest.stream);
      assert.equal(state.stream, latest.stream);
      old.end();
      assert.equal(state.stream, latest.stream);
      mic.stop();
      assert.equal(latest.stopped, 1);
      assert.equal(state.state, 'idle');
    },
  );
});
test('Microphone mount autostart and stop invalidate late success and late failure', async () => {
  const pending = deferred<MediaStream>(),
    late = streamFixture(),
    state = data();
  await globals(
    web(() => pending.promise),
    async () => {
      const mic = createVoiceMicrophone(state, { autoStart: true });
      mic.mount();
      assert.equal(state.state, 'requesting');
      mic.stop();
      pending.resolve(late.stream);
      await pending.promise;
      await Promise.resolve();
      assert.equal(late.stopped, 1);
      assert.equal(state.state, 'idle');
    },
  );
  const failed = deferred<MediaStream>();
  await globals(
    web(() => failed.promise),
    async () => {
      const mic = createVoiceMicrophone(state);
      const request = mic.start();
      mic.stop();
      failed.reject(new Error('late'));
      assert.equal(await request, null);
      assert.equal(state.error, null);
      assert.equal(state.state, 'idle');
    },
  );
});
test('Microphone distinguishes permission errors and retains error through stop', async () => {
  for (const name of ['NotAllowedError', 'SecurityError', 'UnknownError']) {
    const state = data(),
      reason = new Error('failure');
    reason.name = name;
    await globals(
      web(async () => {
        throw reason;
      }),
      async () => {
        const mic = createVoiceMicrophone(state);
        assert.equal(await mic.start(), null);
        assert.equal(state.state, name === 'UnknownError' ? 'error' : 'denied');
        assert.equal(state.error, reason);
        mic.stop();
        assert.equal(state.error, reason);
      },
    );
  }
});
