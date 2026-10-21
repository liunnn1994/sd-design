import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPopupWrapperFoundation,
  type PopupWrapperState,
} from '../dist/trigger/compat-state.js';

function createWrapper(
  state: PopupWrapperState,
  emit: (event: 'update:popupVisible' | 'popupVisibleChange', value: boolean) => void,
) {
  return createPopupWrapperFoundation(
    state,
    (value) => emit('update:popupVisible', value),
    (value) => emit('popupVisibleChange', value),
  );
}

test('Popup wrapper notification ports are plain single-argument callbacks', () => {
  const calls: unknown[] = [],
    state = { localVisible: false };
  const notify = function (this: unknown, visible: boolean) {
    calls.push([this, arguments.length, visible]);
  };
  createPopupWrapperFoundation(state, notify, notify).handlePopupVisibleChange(true);
  assert.deepEqual(calls, [
    [undefined, 1, true],
    [undefined, 1, true],
  ]);
});

for (const controlled of [undefined, false, true])
  for (const local of [false, true]) {
    test(`Popup wrapper derives controlled=${String(controlled)}, local=${local}`, () => {
      const state: PopupWrapperState = { popupVisible: controlled, localVisible: local };
      assert.equal(createWrapper(state, () => {}).getVisible(), controlled ?? local);
    });
  }
test('Popup wrapper construction is lazy and controlled values skip the fallback getter', () => {
  let reads = 0;
  const state = {
    get popupVisible() {
      reads++;
      return false;
    },
    get localVisible() {
      throw Error('fallback read');
    },
    set localVisible(_value: boolean) {},
  };
  const api = createWrapper(state, () => {
    throw Error('emit');
  });
  assert.equal(reads, 0);
  assert.equal(api.getVisible(), false);
  assert.equal(reads, 1);
});
test('Popup wrapper nullish control reads the local getter once and retains its receiver', () => {
  const calls: string[] = [],
    state = {
      get popupVisible() {
        assert.equal(this, state);
        calls.push('controlled');
        return null as unknown as undefined;
      },
      get localVisible() {
        assert.equal(this, state);
        calls.push('local');
        return true;
      },
      set localVisible(_value: boolean) {},
    };
  assert.equal(createWrapper(state, () => {}).getVisible(), true);
  assert.deepEqual(calls, ['controlled', 'local']);
});
test('Popup wrapper never deduplicates a request and writes before both ordered notifications', () => {
  const trace: unknown[] = [],
    state = {
      popupVisible: false,
      get localVisible() {
        throw Error('notification must not read local');
      },
      set localVisible(value: boolean) {
        assert.equal(this, state);
        trace.push(['set', value]);
      },
    };
  const emit = function (this: unknown, event: string, value: boolean) {
    assert.equal(this, undefined);
    assert.equal(arguments.length, 2);
    trace.push([event, value]);
  };
  const api = createWrapper(state, emit);
  api.handlePopupVisibleChange(false);
  api.handlePopupVisibleChange(false);
  assert.deepEqual(trace, [
    ['set', false],
    ['update:popupVisible', false],
    ['popupVisibleChange', false],
    ['set', false],
    ['update:popupVisible', false],
    ['popupVisibleChange', false],
  ]);
});
test('Popup wrapper retains the last request when controlled values change and are released', () => {
  const state: PopupWrapperState = { popupVisible: false, localVisible: false },
    events: unknown[] = [],
    api = createWrapper(state, (...args) => events.push(args));
  api.handlePopupVisibleChange(true);
  assert.equal(state.localVisible, true);
  assert.equal(api.getVisible(), false);
  const mutable = state as { popupVisible: boolean | undefined; localVisible: boolean };
  mutable.popupVisible = true;
  assert.equal(api.getVisible(), true);
  mutable.popupVisible = false;
  assert.equal(api.getVisible(), false);
  mutable.popupVisible = undefined;
  assert.equal(api.getVisible(), true);
  assert.deepEqual(events, [
    ['update:popupVisible', true],
    ['popupVisibleChange', true],
  ]);
});
test('Popup wrapper requests do not inspect the controlled value', () => {
  const state = {
    get popupVisible() {
      throw Error('controlled read');
    },
    localVisible: false,
  };
  let emits = 0;
  createWrapper(state, () => {
    emits++;
  }).handlePopupVisibleChange(true);
  assert.equal(state.localVisible, true);
  assert.equal(emits, 2);
});
for (const value of [true, false, 0, -0, NaN, undefined, 'raw', { key: 0 }]) {
  test(`Popup wrapper forwards the exact request ${String(value)} without normalization`, () => {
    const state = { localVisible: false },
      events: unknown[] = [],
      api = createWrapper(state, (...args) => events.push(args));
    api.handlePopupVisibleChange(value as boolean);
    assert.equal(state.localVisible, value);
    assert.deepEqual(events, [
      ['update:popupVisible', value],
      ['popupVisibleChange', value],
    ]);
  });
}
test('Popup wrapper setter errors skip every notification', () => {
  const failure = Error('setter'),
    state = {
      get localVisible() {
        return false;
      },
      set localVisible(_value: boolean) {
        throw failure;
      },
    };
  assert.throws(
    () => createWrapper(state, () => assert.fail('emitted')).handlePopupVisibleChange(true),
    (error) => error === failure,
  );
});
for (const stop of ['update:popupVisible', 'popupVisibleChange']) {
  test(`Popup wrapper ${stop} errors preserve the requested state and stop in order`, () => {
    const failure = Error(stop),
      state = { localVisible: false },
      events: string[] = [],
      api = createWrapper(state, (event) => {
        events.push(event);
        if (event === stop) throw failure;
      });
    assert.throws(
      () => api.handlePopupVisibleChange(true),
      (error) => error === failure,
    );
    assert.equal(state.localVisible, true);
    assert.deepEqual(
      events,
      stop === 'update:popupVisible'
        ? ['update:popupVisible']
        : ['update:popupVisible', 'popupVisibleChange'],
    );
  });
}
test('Popup wrapper reentrant listeners retain original nested event order and outer payload', () => {
  const events: unknown[] = [],
    state = { localVisible: false };
  const api = createWrapper(state, (event, value) => {
    events.push([event, value, state.localVisible]);
    if (event === 'update:popupVisible' && value) api.handlePopupVisibleChange(false);
  });
  api.handlePopupVisibleChange(true);
  assert.equal(state.localVisible, false);
  assert.deepEqual(events, [
    ['update:popupVisible', true, true],
    ['update:popupVisible', false, false],
    ['popupVisibleChange', false, false],
    ['popupVisibleChange', true, false],
  ]);
});
