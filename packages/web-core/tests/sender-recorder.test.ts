import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createSenderRecorder,
  type SenderRecorderState,
  type UseRecorderOptions,
} from '../dist/sender/recorder.js';

function setup(config: SenderRecorderState['config'] = true, callbacks: UseRecorderOptions = {}) {
  let checks = 0;
  const sessions: ReturnType<typeof createSession>[] = [];
  function createSession(options: Record<string, unknown>) {
    let opened!: () => void, rejected!: (message: string, denied: boolean) => void;
    let stopped!: (blob: Blob, duration: number, mime: string) => void,
      failed!: (message: string) => void;
    return {
      options,
      starts: 0,
      closes: 0,
      stops: 0,
      closeOnStop: false,
      open(success: typeof opened, error: typeof rejected) {
        opened = success;
        rejected = error;
      },
      start() {
        this.starts++;
      },
      close() {
        this.closes++;
      },
      stop(success: typeof stopped, error: typeof failed, close: boolean) {
        this.stops++;
        stopped = success;
        failed = error;
        this.closeOnStop = close;
      },
      opened() {
        opened();
      },
      rejected(message: string, denied: boolean) {
        rejected(message, denied);
      },
      stopped(blob: Blob, duration: number, mime: string) {
        stopped(blob, duration, mime);
      },
      failed(message: string) {
        failed(message);
      },
      process(this: unknown, ...args: unknown[]) {
        return (options.onProcess as (this: unknown, ...args: unknown[]) => unknown).apply(
          this,
          args,
        );
      },
    };
  }
  const driver = Object.assign(
    (options: Record<string, unknown>) => {
      const session = createSession(options);
      sessions.push(session);
      return session;
    },
    {
      Support() {
        checks++;
        return true;
      },
    },
  );
  const state: SenderRecorderState = {
    config,
    supported: false,
    recording: false,
    level: 0,
    requesting: false,
    stopping: false,
    permissionDenied: false,
    captureError: undefined,
    recorder: undefined,
    get available() {
      return Boolean(this.config) && this.supported && !this.permissionDenied;
    },
  };
  const controller = createSenderRecorder(state, driver, callbacks);
  return {
    state,
    controller,
    sessions,
    get checks() {
      return checks;
    },
  };
}

test('Sender recorder checks support lazily after mount, only once across configuration toggles', () => {
  const fixture = setup(false),
    { controller, state } = fixture;
  controller.syncEnabled(true);
  assert.equal(fixture.checks, 0);
  controller.mount();
  assert.equal(fixture.checks, 0);
  state.config = true;
  controller.syncEnabled(true);
  assert.equal(fixture.checks, 1);
  state.config = false;
  controller.syncEnabled(false);
  state.config = true;
  controller.syncEnabled(true);
  assert.equal(fixture.checks, 1);
  assert.equal(controller.available(), true);
});

test('Sender recorder preserves pending guards and delivers stop before clearing its state', () => {
  const blob = new Blob(['audio']);
  const fixture = setup(true, {
    onStop(value, duration, mime) {
      assert.equal(value, blob);
      assert.equal(duration, 120);
      assert.equal(mime, 'audio/pcm');
      assert.equal(fixture.state.recording, true);
      assert.equal(fixture.state.stopping, true);
      assert.equal(fixture.state.recorder, fixture.sessions[0]);
    },
  });
  const { controller, state, sessions } = fixture;
  controller.trigger();
  assert.equal(sessions.length, 0);
  controller.mount();
  controller.trigger();
  controller.trigger();
  assert.equal(sessions.length, 1);
  assert.equal(state.requesting, true);
  sessions[0].opened();
  assert.equal(sessions[0].starts, 1);
  assert.equal(state.recording, true);
  controller.trigger();
  controller.trigger();
  assert.equal(sessions[0].stops, 1);
  assert.equal(sessions[0].closeOnStop, true);
  sessions[0].stopped(blob, 120, 'audio/pcm');
  assert.equal(state.recorder, undefined);
  assert.equal(state.recording, false);
  assert.equal(state.stopping, false);
  assert.equal(state.level, 0);
});

test('Sender recorder closes late opens after disable and preserves the replacement owner', () => {
  const { controller, state, sessions } = setup();
  controller.mount();
  controller.trigger();
  state.config = false;
  controller.syncEnabled(false);
  assert.equal(sessions[0].closes, 1);
  assert.equal(state.requesting, false);
  state.config = true;
  controller.syncEnabled(true);
  controller.trigger();
  const current = state.recorder;
  sessions[0].opened();
  assert.equal(sessions[0].closes, 2);
  assert.equal(sessions[0].starts, 0);
  assert.equal(state.recorder, current);
  assert.equal(state.requesting, true);
  sessions[1].opened();
  assert.equal(state.recording, true);
});

for (const outcome of ['success', 'error'] as const) {
  test(`Sender recorder ignores stale stop ${outcome} after a replacement starts`, () => {
    let notifications = 0;
    const { controller, state, sessions } = setup(true, {
      onStop() {
        notifications++;
      },
      onError() {
        notifications++;
      },
    });
    controller.mount();
    controller.trigger();
    sessions[0].opened();
    controller.trigger();
    state.config = false;
    controller.syncEnabled(false);
    state.config = true;
    controller.syncEnabled(true);
    controller.trigger();
    sessions[1].opened();
    if (outcome === 'success') sessions[0].stopped(new Blob(), 0, 'audio/pcm');
    else sessions[0].failed('old error');
    assert.equal(notifications, 0);
    assert.equal(state.recorder, sessions[1]);
    assert.equal(state.recording, true);
  });
}

test('Sender recorder errors preserve permission/error distinction and status priority', () => {
  const errors: [string, boolean][] = [];
  const { controller, state, sessions } = setup(true, {
    onError(message, denied) {
      errors.push([message, denied]);
    },
  });
  assert.equal(controller.statusKey(), 'sender.speech.unsupported');
  controller.mount();
  controller.trigger();
  assert.equal(controller.statusKey(), 'sender.speech.requestingPermission');
  sessions[0].rejected('denied', true);
  assert.equal(controller.statusKey(), 'sender.speech.permissionDenied');
  assert.equal(controller.available(), false);
  assert.equal(state.captureError, undefined);
  state.permissionDenied = false;
  controller.trigger();
  sessions[1].rejected('unavailable', false);
  assert.equal(controller.statusKey(), 'sender.speech.microphoneUnavailable');
  assert.equal(controller.available(), true);
  controller.trigger();
  sessions[2].opened();
  assert.equal(state.captureError, undefined);
  assert.equal(controller.statusKey(), 'sender.speech.stop');
  controller.trigger();
  sessions[2].failed('encoding');
  assert.deepEqual(errors, [
    ['denied', true],
    ['unavailable', false],
    ['encoding', false],
  ]);
  assert.equal(controller.statusKey(), 'sender.speech.start');
  assert.equal(state.recorder, undefined);
});

test('Sender recorder forwards process arguments, this and return value while normalizing level', () => {
  const receiver = {},
    args: unknown[] = [[], 50, 120, 48000, 0, () => {}];
  const calls: unknown[][] = [];
  const { controller, state, sessions } = setup({
    type: 'pcm',
    onProcess(this: unknown, ...values: unknown[]) {
      assert.equal(this, receiver);
      calls.push(values);
      return true;
    },
  });
  controller.mount();
  controller.trigger();
  assert.equal(sessions[0].process.apply(receiver, args), true);
  assert.deepEqual(calls[0], args);
  assert.equal(state.level, 0.5);
  for (const [power, level] of [
    [200, 1],
    [-1, 0],
    [20, 0.2],
  ] as const) {
    sessions[0].process.call(receiver, [], power);
    assert.equal(state.level, level);
  }
  sessions[0].process.call(receiver, [], 'non-number');
  assert.equal(state.level, 0.2);
});

test('Sender recorder ignores open/stop callbacks after disposal and closes current resources', () => {
  let notifications = 0;
  const { controller, state, sessions } = setup(true, {
    onStop() {
      notifications++;
    },
    onError() {
      notifications++;
    },
  });
  controller.mount();
  controller.trigger();
  controller.dispose();
  sessions[0].opened();
  sessions[0].rejected('late', true);
  assert.equal(sessions[0].starts, 0);
  assert.equal(sessions[0].closes, 3);
  assert.equal(state.recorder, undefined);
  assert.equal(state.requesting, false);
  assert.equal(notifications, 0);
  const next = setup(true, {
    onStop() {
      notifications++;
    },
    onError() {
      notifications++;
    },
  });
  next.controller.mount();
  next.controller.trigger();
  next.sessions[0].opened();
  next.controller.trigger();
  next.controller.dispose();
  next.sessions[0].stopped(new Blob(), 0, 'audio/pcm');
  next.sessions[0].failed('late');
  assert.equal(next.state.recording, false);
  assert.equal(next.state.stopping, false);
  assert.equal(notifications, 0);
});
