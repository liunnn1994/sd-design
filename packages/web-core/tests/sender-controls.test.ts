import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import {
  createSenderHeader,
  createSenderSwitch,
  createSenderSkillTag,
  isSenderSkillCloseDisabled,
  resolveSenderSkillTooltip,
} from '../dist/sender/controls.js';

function frames(t: TestContext) {
  let next = 0;
  const callbacks = new Map<number, FrameRequestCallback>(),
    cancelled: number[] = [];
  for (const [key, value] of Object.entries({
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = next++;
      callbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      cancelled.push(id);
      callbacks.delete(id);
    },
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  return {
    cancelled,
    flush() {
      const pending = [...callbacks.values()];
      callbacks.clear();
      pending.forEach((callback) => callback(0));
    },
    get size() {
      return callbacks.size;
    },
  };
}

test('Sender header construction and cleanup are inert without DOM and keep force-render semantics', () => {
  const state = { props: { open: false, forceRender: true }, rendered: false };
  const header = createSenderHeader(state, { update() {}, change() {} });
  assert.equal(state.rendered, true);
  header.afterLeave();
  assert.equal(state.rendered, true);
  state.props.forceRender = false;
  header.syncRendered(false, false);
  assert.equal(state.rendered, true);
  header.afterLeave();
  assert.equal(state.rendered, false);
  header.syncRendered(true, false);
  assert.equal(state.rendered, true);
  header.cancelFrame();
  assert.equal(typeof globalThis.document, 'undefined');
});

test('Sender header publishes its captured toggle request before open-change', () => {
  const state = { props: { open: true, forceRender: false }, rendered: false };
  const events: [string, boolean][] = [];
  const header = createSenderHeader(state, {
    update(value) {
      events.push(['update', value]);
      state.props.open = false;
    },
    change(value) {
      events.push(['change', value]);
    },
  });
  header.close();
  assert.deepEqual(events, [
    ['update', false],
    ['change', false],
  ]);
});

test('Sender header animation keeps measurement timing and cancels frame zero before final styles', (t) => {
  const clock = frames(t),
    state = { props: { open: true, forceRender: false }, rendered: false };
  const header = createSenderHeader(state, { update() {}, change() {} });
  let height = 50;
  const style = { height: '', borderBottomColor: '' };
  const element = {
    style,
    get scrollHeight() {
      return height;
    },
  } as unknown as Element;
  header.beforeEnter(element);
  header.enter(element);
  height = 80;
  assert.deepEqual(style, { height: '0', borderBottomColor: 'transparent' });
  header.afterEnter(element);
  assert.deepEqual(clock.cancelled, [0]);
  clock.flush();
  assert.equal(style.height, 'auto');
  header.beforeLeave(element);
  assert.equal(style.height, '80px');
  header.leave(element);
  clock.flush();
  assert.deepEqual(style, { height: '0', borderBottomColor: 'transparent' });
  state.props.open = true;
  header.afterLeave();
  assert.equal(state.rendered, true);
  header.beforeEnter(element);
  header.enter(element);
  height = 120;
  clock.flush();
  assert.equal(style.height, '120px');
  header.leave(element);
  header.cancelFrame();
  clock.flush();
  assert.equal(style.height, '120px');
});

test('Sender switch preserves controlled undefined, default resync and captured update/change values', () => {
  const props: { modelValue?: boolean | undefined; disabled?: boolean; loading?: boolean } = {
    modelValue: undefined,
  };
  let foundation!: ReturnType<typeof createSenderSwitch>;
  const state = {
    props,
    controlled: true,
    innerChecked: true,
    get checked(): boolean {
      return foundation.checked();
    },
  };
  const events: [string, boolean][] = [];
  foundation = createSenderSwitch(state, {
    update(value) {
      events.push(['update', value]);
      props.modelValue = false;
    },
    change(value) {
      events.push(['change', value]);
    },
  });
  assert.equal(foundation.checked(), false);
  foundation.syncDefault(false);
  assert.equal(state.innerChecked, true);
  foundation.change();
  assert.deepEqual(events, [
    ['update', true],
    ['change', true],
  ]);
  assert.equal(foundation.checked(), false);
  state.controlled = false;
  foundation.syncDefault(false);
  assert.equal(foundation.checked(), false);
  foundation.change();
  assert.equal(state.innerChecked, true);
  events.length = 0;
  props.disabled = true;
  foundation.change();
  props.disabled = false;
  props.loading = true;
  foundation.change();
  assert.deepEqual(events, []);
});

test('Sender skill tooltip remains opaque and close-disabled retains the original optional values', () => {
  const tooltip = { content: { opaque: true } };
  assert.equal(resolveSenderSkillTooltip({ tooltip }), tooltip);
  assert.deepEqual(resolveSenderSkillTooltip({ tooltip: 'text' }), { content: 'text' });
  assert.equal(resolveSenderSkillTooltip({}), undefined);
  assert.equal(isSenderSkillCloseDisabled({ skill: { closable: {} } }), undefined);
  assert.equal(isSenderSkillCloseDisabled({ skill: { closable: true } }), false);
  assert.equal(isSenderSkillCloseDisabled({ readonly: true, skill: {} }), true);
  assert.equal(isSenderSkillCloseDisabled({ skill: { closable: { disabled: true } } }), true);
});

test('Sender skill removal events preserve key filtering, propagation and original event identity', () => {
  const calls: string[] = [],
    events: Event[] = [];
  const tag = createSenderSkillTag((event) => {
    calls.push('remove');
    events.push(event);
  });
  for (const key of ['Escape', 'Enter', ' ']) {
    calls.length = 0;
    const event = {
      key,
      preventDefault() {
        calls.push('prevent');
      },
      stopPropagation() {
        calls.push('stop');
      },
    } as unknown as KeyboardEvent;
    tag.keydown(event);
    assert.deepEqual(calls, key === 'Escape' ? [] : ['prevent', 'stop', 'remove']);
    if (key !== 'Escape') assert.equal(events.at(-1), event);
  }
  calls.length = 0;
  const event = {
    stopPropagation() {
      calls.push('stop');
    },
  } as unknown as Event;
  tag.remove(event);
  assert.deepEqual(calls, ['stop', 'remove']);
  assert.equal(events.at(-1), event);
});
