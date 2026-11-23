import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createInputMaskFoundation,
  type InputMaskFoundationState,
} from '../dist/input-mask/foundation.js';
import {
  defaultInputMaskFormatChars,
  formatInputMask,
  resolveDeletion,
} from '../dist/input-mask/mask-engine.js';
import { createInputMaskPresets } from '../dist/input-mask/presets.js';

test('InputMask exposes only mask-useful validator formats as presets', () => {
  const presets = createInputMaskPresets('Local IP');
  for (const name of ['ip', 'url', 'semver']) assert.ok(Object.hasOwn(presets, name));
  for (const name of ['md5', 'port']) assert.equal(Object.hasOwn(presets, name), false);
});

test('InputMask deletes the adjacent editable value when backspacing a separator', () => {
  const result = resolveDeletion(
    '2026-__-__',
    { start: 5, end: 5 },
    '2026__-__',
    4,
    '9999-99-99',
    defaultInputMaskFormatChars,
    '_',
  );
  assert.equal(result?.value, '202_-__-__');
  assert.equal(result?.cursor, 3);
});

test('InputMask reformatting preserves a multi-character array literal', () => {
  const mask = ['+86 ', /\d/, /\d/] as const;
  const options = { maskChar: null, showMask: true };
  const formatted = formatInputMask('12', null, mask, options);
  assert.equal(formatted.value, '+86 12');
  assert.equal(formatInputMask(formatted.value, null, mask, options).value, formatted.value);
});

test('InputMask treats combining sequences and astral characters as single graphemes', () => {
  const options = { maskChar: null, showMask: true };
  const combining = 'e\u0301';
  assert.equal(formatInputMask(combining, combining.length, 'L', options).value, combining);
  const char = '𠀀';
  const astral = formatInputMask(char, char.length, 'H', options);
  assert.equal(astral.value, char);
  assert.equal(astral.complete, true);
});

test('InputMask enforces rgb() / hsl() structure instead of a bare character whitelist', () => {
  const presets = createInputMaskPresets('Local IP');
  const rgb = presets['rgb-color'];
  assert.equal(rgb.accepts?.('rgb(22, 119, 255)'), true);
  assert.equal(rgb.accepts?.('rgba(22, 119, 255, 0.5)'), true);
  assert.equal(rgb.accepts?.('xyz'), false);
  assert.equal(rgb.accepts?.('22, 119, 255'), false);

  const hsl = presets['hsl'];
  assert.equal(hsl.accepts?.('hsl(210, 100%, 50%)'), true);
  assert.equal(hsl.accepts?.('hsla(210, 100%, 50%, 0.5)'), true);
  assert.equal(hsl.accepts?.('210 100 50'), false);
});

test('InputMask differentiates datetime (space separator) from rfc3339 (T only)', () => {
  const presets = createInputMaskPresets('Local IP');
  const datetime = presets['datetime'];
  const rfc3339 = presets['rfc3339'];
  assert.equal(datetime.accepts?.('2026-08-06 10:30:00'), true);
  assert.equal(rfc3339.accepts?.('2026-08-06 10:30:00'), false);
  assert.equal(rfc3339.accepts?.('2026-08-06T10:30:00'), true);
});

test('InputMask enforces ip-range structure with a bounded prefix', () => {
  const presets = createInputMaskPresets('Local IP');
  const ipRange = presets['ip-range'];
  assert.equal(ipRange.accepts?.('192.168.1.0/24'), true);
  assert.equal(ipRange.accepts?.('192.168.1.0'), true);
  assert.equal(ipRange.accepts?.('192.168.1.0/33'), false);
  assert.equal(ipRange.accepts?.('192.168.1.0/abc'), false);
});

test('InputMask treats escaped characters and dangling backslashes in string masks as literals', () => {
  // \9 in a string mask is a literal '9', not the numeric token.
  const escaped = formatInputMask('1', null, '\\9-9', { maskChar: null, showMask: true });
  assert.equal(escaped.value, '9-1');

  // A trailing lone backslash degrades to a literal backslash instead of throwing.
  const dangling = formatInputMask('a', null, 'a\\', { maskChar: null, showMask: true });
  assert.equal(dangling.value, 'a\\');
});

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
test('InputMask ignores an older queued selection after a newer input', () => {
  const { state, foundation, env, queue } = fixture({ mask: '9999' });
  const target = input(1);
  env.input = target.element;
  state.focused = true;
  foundation.handleModelUpdate('1');
  queue.shift()!();
  target.element.selectionStart = 2;
  foundation.handleModelUpdate('12');
  queue.shift()!();
  assert.deepEqual(target.calls, []);
  queue.shift()!();
  queue.shift()!();
  assert.deepEqual(target.calls, [[2, 2]]);
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
