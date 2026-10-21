import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createInputMaskFoundation,
  type InputMaskFoundationState,
} from '../dist/input-mask/foundation.js';
import { createInputMaskPresets } from '../dist/input-mask/presets.js';
function fixture(props: Partial<InputMaskFoundationState['props']> = {}) {
  let foundation!: ReturnType<typeof createInputMaskFoundation>;
  const events: unknown[][] = [],
    queue: (() => void)[] = [];
  const env = { input: undefined as HTMLInputElement | undefined };
  const state: InputMaskFoundationState = {
    props: { defaultValue: '', maskChar: '_', alwaysShowMask: false, ...props },
    presets: createInputMaskPresets('Local IP'),
    get inputElement() {
      return env.input;
    },
    focused: false,
    lastSelection: null,
    complete: false,
    innerValue: '',
    get presetDefinition() {
      return foundation.getPresetDefinition();
    },
    get effectiveMask() {
      return foundation.getEffectiveMask();
    },
    get effectiveFormatChars() {
      return foundation.getEffectiveFormatChars();
    },
    get effectiveMaskChar() {
      return foundation.getEffectiveMaskChar();
    },
    get hasValue() {
      return foundation.getHasValue();
    },
  };
  foundation = createInputMaskFoundation(state, {
    update(value) {
      events.push(['update', value]);
    },
    complete(value) {
      events.push(['complete', value, state.complete]);
    },
    input(value, event) {
      events.push(['input', value, event]);
    },
    change(value, event) {
      events.push(['change', value, event]);
    },
    pressEnter(event) {
      events.push(['enter', event]);
    },
    clear(event) {
      events.push(['clear', event]);
    },
    focus(event) {
      events.push(['focus', event, state.focused]);
    },
    blur(event) {
      events.push(['blur', event, state.focused]);
    },
    afterRender(task) {
      queue.push(task);
    },
  });
  foundation.initialize();
  return { foundation, state, events, env, queue };
}
function input(cursor: number) {
  const calls: unknown[][] = [];
  const listeners = new Map<string, () => void>();
  const element = {
    selectionStart: cursor,
    selectionEnd: cursor,
    setSelectionRange(start: number, end: number) {
      calls.push([start, end]);
    },
    addEventListener(name: string, listener: () => void) {
      listeners.set(name, listener);
    },
    removeEventListener(name: string, listener: () => void) {
      assert.equal(listeners.get(name), listener);
      listeners.delete(name);
    },
  };
  return { element: element as unknown as HTMLInputElement, calls, listeners };
}
function documentScope(value: unknown, run: () => void) {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { value, configurable: true });
  try {
    run();
  } finally {
    if (old) Object.defineProperty(globalThis, 'document', old);
    else Reflect.deleteProperty(globalThis, 'document');
  }
}

test('InputMask initializes and derives display without DOM while keeping committed and displayed values distinct', () => {
  const { foundation, state, events } = fixture({ mask: '99', defaultValue: '1' });
  assert.equal(state.innerValue, '1_');
  assert.equal(foundation.getDisplayValue(), '1_');
  assert.equal(state.hasValue, true);
  assert.equal(state.complete, false);
  assert.deepEqual(events, []);
  state.props.alwaysShowMask = true;
  foundation.syncModel(null);
  assert.equal(state.innerValue, '');
  assert.equal(foundation.getDisplayValue(), '__');
  assert.equal(state.hasValue, false);
  assert.deepEqual(events, [['update', '']]);
});
test('InputMask explicit mask and format overrides, grapheme placeholder and length ownership remain unchanged', () => {
  const { state, foundation } = fixture({
    preset: 'uuid',
    mask: 'XX',
    maskChar: '👩🏽‍💻rest',
    formatChars: { X: /[A-Z]/ },
  });
  assert.equal(state.effectiveMask, 'XX');
  assert.equal(state.effectiveMaskChar, '👩🏽‍💻');
  assert.equal(foundation.getLengthManaged(), true);
  assert.equal(state.effectiveFormatChars.X, state.props.formatChars?.X);
  state.props.maskChar = null;
  assert.equal(state.effectiveMaskChar, null);
  state.props.mask = '';
  assert.equal(state.effectiveMask, '');
  assert.equal(foundation.getLengthManaged(), true);
});
test('InputMask model synchronization echoes only normalized models and completes on false-to-true edges', () => {
  const { foundation, state, events } = fixture({ mask: '99' });
  foundation.syncModel('12');
  foundation.syncModel('12');
  assert.deepEqual(events, [['complete', '12', false]]);
  assert.equal(state.complete, true);
  foundation.syncModel(undefined);
  assert.equal(state.complete, false);
  foundation.syncModel('34');
  assert.deepEqual(events, [
    ['complete', '12', false],
    ['update', ''],
    ['complete', '34', false],
  ]);
});
test('InputMask before-change rejection and completion supply preserve callback and notification order', () => {
  const { state, foundation, events } = fixture({
    mask: '99',
    defaultValue: '1',
    beforeMaskedValueChange: (next, previous) => (next.value === '12' ? previous : next),
  });
  foundation.handleModelUpdate('12');
  assert.equal(state.innerValue, '1_');
  assert.deepEqual(events, [['update', '1']]);
  state.props.beforeMaskedValueChange = (next) => ({ ...next, value: '34' });
  foundation.handleModelUpdate('2');
  assert.equal(state.innerValue, '34');
  assert.deepEqual(events, [
    ['update', '1'],
    ['update', '34'],
    ['complete', '34', false],
  ]);
});
test('InputMask selection restore waits two injected renders and reads the current element and focus', () => {
  const { state, foundation, env, queue } = fixture({ mask: '99' });
  const old = input(1),
    current = input(0);
  env.input = old.element;
  state.focused = true;
  foundation.handleModelUpdate('12');
  assert.equal(queue.length, 1);
  assert.equal(old.calls.length, 0);
  queue.shift()!();
  assert.equal(queue.length, 1);
  env.input = current.element;
  queue.shift()!();
  assert.deepEqual(current.calls, [[state.lastSelection!.start, state.lastSelection!.end]]);
  assert.equal(old.calls.length, 0);
  foundation.handleModelUpdate('34');
  state.focused = false;
  queue.shift()!();
  queue.shift()!();
  assert.equal(current.calls.length, 1);
});
test('InputMask rejected preset insertion keeps the previous value and corrects mid-string cursor', () => {
  const { state, foundation, env } = fixture({ preset: 'ip', defaultValue: '25.1' });
  env.input = input(2).element;
  foundation.handleModelUpdate('256.1');
  assert.equal(state.innerValue, '25.1');
  assert.deepEqual(state.lastSelection, { start: 1, end: 1 });
});
test('InputMask input/change payloads retain filled display state while focus events update state first', () => {
  const { foundation, state, events } = fixture({ mask: '99', defaultValue: '1' });
  const event = new Event('input');
  foundation.handleInput('ignored', event);
  foundation.handleChange('ignored', event);
  foundation.handleFocus(event as FocusEvent);
  foundation.handleBlur(event as FocusEvent);
  assert.deepEqual(events, [
    ['input', '1_', event],
    ['change', '1_', event],
    ['focus', event, true],
    ['blur', event, false],
  ]);
  assert.equal(state.focused, false);
});
test('InputMask mount publishes an initially complete mask and selection listeners clean up by identity', () => {
  const { foundation, state, events, env } = fixture({ mask: '99', defaultValue: '12' });
  const native = input(1);
  native.element.selectionEnd = 2;
  env.input = native.element;
  const listeners = new Map<string, () => void>();
  const document = {
    activeElement: native.element,
    addEventListener(name: string, fn: () => void) {
      listeners.set(name, fn);
    },
    removeEventListener(name: string, fn: () => void) {
      assert.equal(listeners.get(name), fn);
      listeners.delete(name);
    },
  };
  documentScope(document, () => {
    foundation.mount();
    assert.deepEqual(events, [['complete', '12', false]]);
    assert.deepEqual([...native.listeners.keys()], ['keyup', 'mouseup', 'select']);
    listeners.get('selectionchange')!();
    assert.deepEqual(state.lastSelection, { start: 1, end: 2 });
    foundation.dispose();
    assert.equal(native.listeners.size, 0);
    assert.equal(listeners.size, 0);
  });
});
test('InputMask template removal strips old placeholders before re-normalizing and notifying', () => {
  const { state, foundation, events } = fixture({ mask: '99-99', defaultValue: '12' });
  const oldMask = state.effectiveMask,
    oldChar = state.effectiveMaskChar,
    oldFormat = state.effectiveFormatChars;
  assert.equal(state.innerValue, '12-__');
  delete state.props.mask;
  foundation.syncMask([], [oldMask, undefined, oldChar, oldFormat]);
  assert.equal(state.innerValue, '12-');
  assert.deepEqual(events, [['update', '12-']]);
});
test('InputMask input attributes retain opaque values and explicit inputmode while injecting preset data', () => {
  const marker = { opaque: true };
  const { foundation, state } = fixture({ preset: 'ipv4', inputAttrs: { inputmode: '', marker } });
  const attrs = foundation.getMergedInputAttrs();
  assert.equal(attrs.inputmode, '');
  assert.equal(attrs.marker, marker);
  assert.equal(attrs['data-mask-preset'], 'ipv4');
  delete state.props.inputAttrs;
  assert.equal(foundation.getMergedInputAttrs().inputmode, 'decimal');
});
test('InputMask preset factory injects only localized IP text and preserves independent regex registries', () => {
  const first = createInputMaskPresets('First'),
    second = createInputMaskPresets('Second');
  assert.equal(first.ip.placeholder, 'First');
  assert.equal(second.ip.placeholder, 'Second');
  assert.equal(first.uuid.placeholder, second.uuid.placeholder);
  assert.notEqual(first.uuid.formatChars?.h, second.uuid.formatChars?.h);
  assert.equal(first.ip.accepts?.('255.1'), true);
  assert.equal(first.ip.accepts?.('256.1'), false);
});
