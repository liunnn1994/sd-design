import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createLegacyInputFoundation, type LegacyInputState } from '../dist/text-input/legacy.js';
function fixture(options: { eventName?: string; updateEventName?: string } = {}) {
  let controller: ReturnType<typeof createLegacyInputFoundation>;
  const events: unknown[][] = [],
    renders: (() => void)[] = [];
  const input = {
    value: 'seed',
    focus() {
      events.push(['native-focus']);
    },
  } as HTMLInputElement;
  const state: { -readonly [Key in keyof LegacyInputState]: LegacyInputState[Key] } = {
    input,
    modelValue: undefined,
    get computedValue() {
      return controller.getValue();
    },
    eventHandlers: undefined,
    value: 'seed',
    focused: false,
    isComposition: false,
    compositionValue: '',
  };
  controller = createLegacyInputFoundation(state, {
    ...options,
    emit: function (name, ...args) {
      assert.equal(this, undefined);
      events.push([name, ...args]);
    },
    afterRender: function (callback) {
      assert.equal(this, undefined);
      renders.push(callback);
    },
  });
  return { state, events, renders, input, controller };
}
const ev = (target: unknown, type = 'input', extra: object = {}) =>
  ({ target, type, ...extra }) as Event;
test('legacy computed value keeps controlled empty strings and uncontrolled fallback', () => {
  const { state, controller } = fixture();
  assert.equal(controller.getValue(), 'seed');
  state.modelValue = '';
  assert.equal(controller.getValue(), '');
  state.modelValue = undefined;
  state.value = 'local';
  assert.equal(controller.getValue(), 'local');
});
test('input updates local state and emits update before input while rejected model remains authoritative', () => {
  const { state, input, events, renders, controller } = fixture();
  state.modelValue = 'held';
  input.value = 'draft';
  const event = ev(input);
  controller.handleInput(event);
  assert.equal(state.value, 'draft');
  assert.deepEqual(events, [
    ['update:modelValue', 'draft'],
    ['input', 'draft', event],
  ]);
  assert.equal(renders.length, 1);
  renders[0]();
  assert.equal(input.value, 'held');
});
test('render restoration reads the latest model and replacement native input', () => {
  const { state, input, renders, controller } = fixture();
  input.value = 'draft';
  controller.handleInput(ev(input));
  const replacement = { value: 'other' } as HTMLInputElement;
  state.input = replacement;
  state.modelValue = 'latest';
  renders[0]();
  assert.equal(replacement.value, 'latest');
  assert.equal(input.value, 'draft');
});
test('composition start/update use current model plus data and end clears composition before publishing', () => {
  const { state, input, events, renders, controller } = fixture();
  controller.handleComposition(ev(input, 'compositionstart', { data: '中' }) as CompositionEvent);
  assert.equal(state.isComposition, true);
  assert.equal(state.compositionValue, 'seed中');
  controller.handleComposition(ev(input, 'compositionupdate', { data: '文' }) as CompositionEvent);
  assert.equal(state.compositionValue, 'seed文');
  input.value = '完整';
  const end = ev(input, 'compositionend');
  controller.handleComposition(end as CompositionEvent);
  assert.equal(state.isComposition, false);
  assert.equal(state.compositionValue, '');
  assert.equal(state.value, '完整');
  assert.deepEqual(events, [
    ['update:modelValue', '完整'],
    ['input', '完整', end],
  ]);
  assert.equal(renders.length, 1);
});
test('active composition suppresses ordinary input and Enter, including render repair', () => {
  const { state, input, events, renders, controller } = fixture();
  state.isComposition = true;
  input.value = 'partial';
  controller.handleInput(ev(input));
  controller.handleKeyDown({ key: 'Enter' } as KeyboardEvent);
  assert.deepEqual(events, []);
  assert.deepEqual(renders, []);
  assert.equal(state.value, 'seed');
});
test('focus/blur ordering retains form receiver, exact event and deduplicated change', () => {
  const { state, input, events, controller } = fixture();
  const handlers = {
    onFocus(event: FocusEvent) {
      assert.equal(this, handlers);
      assert.equal(state.focused, true);
      events.push(['form-focus', event]);
    },
    onBlur(event: FocusEvent) {
      assert.equal(this, handlers);
      assert.equal(state.focused, false);
      events.push(['form-blur', event]);
    },
  };
  state.eventHandlers = handlers;
  const focus = ev(input, 'focus') as FocusEvent,
    blur = ev(input, 'blur') as FocusEvent;
  controller.handleFocus(focus);
  state.value = 'changed';
  controller.handleBlur(blur);
  assert.deepEqual(events, [
    ['focus', focus],
    ['form-focus', focus],
    ['blur', blur],
    ['form-blur', blur],
    ['change', 'changed', blur],
  ]);
});
test('custom InputLabel names preserve payloads and do not synthesize default change', () => {
  const { state, input, events, controller } = fixture({
    eventName: 'inputValueChange',
    updateEventName: 'update:inputValue',
  });
  const focus = ev(input, 'focus') as FocusEvent,
    event = ev(input),
    blur = ev(input, 'blur') as FocusEvent;
  controller.handleFocus(focus);
  input.value = 'new';
  controller.handleInput(event);
  controller.handleBlur(blur);
  assert.deepEqual(events, [
    ['focus', focus],
    ['update:inputValue', 'new'],
    ['inputValueChange', 'new', event],
    ['blur', blur],
  ]);
  assert.equal(state.value, 'new');
});
test('Enter key/code handling emits press before one change and blur does not repeat it', () => {
  const { state, input, events, controller } = fixture();
  controller.handleFocus(ev(input, 'focus') as FocusEvent);
  events.length = 0;
  state.value = 'changed';
  const enter = { key: '', code: 'Enter' } as KeyboardEvent;
  controller.handleKeyDown(enter);
  controller.handleKeyDown(enter);
  controller.handleBlur(ev(input, 'blur') as FocusEvent);
  assert.deepEqual(events.slice(0, 3), [
    ['pressEnter', enter],
    ['change', 'changed', enter],
    ['pressEnter', enter],
  ]);
  assert.equal(events.filter((e) => e[0] === 'change').length, 1);
});
test('blur before initial focus preserves the original initial-value comparison', () => {
  const { input, events, controller } = fixture();
  const blur = ev(input, 'blur') as FocusEvent;
  controller.handleBlur(blur);
  controller.handleBlur(blur);
  assert.equal(events.filter((e) => e[0] === 'change').length, 1);
});
test('native synchronization avoids redundant writes and pending repair tolerates an absent input', () => {
  const { state, input, renders, controller } = fixture();
  let writes = 0,
    value = 'seed';
  Object.defineProperty(input, 'value', {
    get: () => value,
    set(next) {
      writes++;
      value = next;
    },
  });
  controller.syncInput('seed');
  assert.equal(writes, 0);
  controller.syncInput('next');
  assert.equal(writes, 1);
  controller.handleInput(ev(input));
  state.input = undefined;
  renders[0]();
  controller.syncInput('late');
  assert.equal(writes, 1);
});
test('wrapper mousedown focuses only a different native target and prevents default first', () => {
  const { input, events, controller } = fixture();
  let prevented = 0;
  controller.handleMousedown({
    target: input,
    preventDefault() {
      prevented++;
    },
  } as unknown as MouseEvent);
  assert.equal(prevented, 0);
  controller.handleMousedown({
    target: {},
    preventDefault() {
      prevented++;
      events.push(['prevent']);
    },
  } as unknown as MouseEvent);
  assert.deepEqual(events, [['prevent'], ['native-focus']]);
});
test('notification failure preserves local update and stops subsequent notification/repair', () => {
  const { state, input, renders } = fixture();
  const failure = Error('emit failed');
  const controller = createLegacyInputFoundation(state, {
    emit() {
      throw failure;
    },
    afterRender: (callback) => renders.push(callback),
  });
  input.value = 'draft';
  assert.throws(() => controller.handleInput(ev(input)), failure);
  assert.equal(state.value, 'draft');
  assert.deepEqual(renders, []);
});
