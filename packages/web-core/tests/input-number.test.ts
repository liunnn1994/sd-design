import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { InputNumberOptions, InputNumberStep } from '../src/input-number/types.ts';

import {
  createInputNumberData,
  configureInputNumberPrecision,
  getInitialInputNumberMode,
} from '../dist/input-number/data.js';
import { createInputNumberFoundation } from '../dist/input-number/foundation.js';

configureInputNumberPrecision();

function setup(patch: Partial<InputNumberOptions> = {}) {
  const options: InputNumberOptions = {
    stringMode: false,
    step: 1,
    min: -Infinity,
    max: Infinity,
    readonly: false,
    modelEvent: 'change',
    ...patch,
  };
  let mode = getInitialInputNumberMode(options);
  const data = createInputNumberData(options, {
    get precision() {
      return data.getPrecision();
    },
    get mode() {
      return mode;
    },
    get raw() {
      return raw;
    },
  });
  let inner = data.getDisplayValue(options.modelValue ?? options.defaultValue);
  let raw = data.getRawText(options.modelValue ?? options.defaultValue, inner);
  let min = data.compareToBoundary(data.getNumberValue(inner), options.min) <= 0;
  let max = data.compareToBoundary(data.getNumberValue(inner), options.max) >= 0;
  let disabled = false;
  let cancelKey = false;
  let timerId = 0;
  let method: InputNumberStep = 'plus';
  const timers = new Map<number, { callback: () => void; delay: number }>();
  const events: unknown[][] = [];
  const foundation = createInputNumberFoundation({
    options,
    data,
    get inner() {
      return inner;
    },
    get raw() {
      return raw;
    },
    get number() {
      return data.getNumberValue(inner);
    },
    get minReached() {
      return min;
    },
    get maxReached() {
      return max;
    },
    setInner: (value) => {
      inner = value;
    },
    setRaw: (value) => {
      raw = value;
    },
    setMinReached: (value) => {
      min = value;
    },
    setMaxReached: (value) => {
      max = value;
    },
    setMode: (value) => {
      mode = value;
    },
    isDisabled: () => disabled,
    isMouseEvent: (event) => event.type === 'click',
    focus: () => events.push(['focus']),
    setTimer: (callback, delay) => {
      timers.set(++timerId, { callback, delay });
      return timerId;
    },
    clearTimer: (id) => {
      timers.delete(id);
    },
    dispatchRepeat: (event) => {
      events.push(['repeat', event]);
      foundation.handleStepButton(event, method, true);
    },
    onUpdate: (value) => events.push(['update', value]),
    onChange: (value, event) => events.push(['change', value, event]),
    onInput: (value, text, event) => events.push(['input', value, text, event]),
    onBlur: (event) => events.push(['blur', event]),
    onClear: (event) => events.push(['clear', event]),
    onKeydown: (event) => {
      events.push(['keydown', event]);
      if (cancelKey) event.preventDefault();
    },
    onFormChange: (event) => events.push(['form', event]),
  });
  const press = (
    next: InputNumberStep,
    repeat = false,
    event = new Event('mousedown', { cancelable: true }),
  ) => {
    method = next;
    foundation.handleStepButton(event, next, repeat);
    return event;
  };
  const key = (key: string, modifiers: Partial<KeyboardEvent> = {}) => {
    const event = Object.assign(new Event('keydown', { cancelable: true }), {
      key,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      ...modifiers,
    }) as KeyboardEvent;
    foundation.onKeyDown(event);
    return event;
  };
  const fireTimer = () => {
    const [id, timer] = timers.entries().next().value!;
    timers.delete(id);
    timer.callback();
  };
  return {
    options,
    data,
    foundation,
    events,
    timers,
    press,
    key,
    fireTimer,
    inner: () => inner,
    raw: () => raw,
    min: () => min,
    max: () => max,
    setDisabled: (value: boolean) => {
      disabled = value;
    },
    setCancelKey: (value: boolean) => {
      cancelKey = value;
    },
  };
}

test('InputNumber data preserves partial/invalid values and legacy numeric/string output modes', () => {
  const numeric = setup();
  for (const value of [null, undefined, '', '-', '.', Infinity, NaN])
    assert.equal(numeric.data.getNumberValue(value), undefined);
  assert.equal(numeric.data.getDisplayValue('-'), '-');
  assert.equal(numeric.data.getDisplayValue(Infinity), '');
  assert.equal(numeric.data.getModelValue(undefined), undefined);
  const legacy = setup({ defaultValue: '02' });
  assert.equal(legacy.inner(), '2');
  assert.equal(legacy.foundation.getEmittedValue(), '2');
  assert.equal(legacy.data.getModelValue(undefined), '');
});

test('InputNumber stringMode keeps raw digits and trailing zeros through formatting and commit', () => {
  const state = setup({
    stringMode: true,
    modelValue: '9007199254740993.100',
    formatter: (value) => `$${value}`,
    parser: (value) => value.replace('$', ''),
  });
  assert.equal(state.inner(), '$9007199254740993.100');
  assert.equal(state.foundation.getEmittedValue(), '9007199254740993.100');
  const event = new Event('input');
  state.foundation.handleInput('9007199254740993.1002', event);
  assert.deepEqual(state.events[0], [
    'input',
    '9007199254740993.1002',
    '$9007199254740993.1002',
    event,
  ]);
  state.foundation.handleChange(state.inner(), new Event('change'));
  assert.equal(state.foundation.getEmittedValue(), '9007199254740993.1002');
});

test('InputNumber high-precision stepping uses raw decimals instead of rounded Number values', () => {
  const state = setup({ stringMode: true, modelValue: '9007199254740993.1', step: 0.1 });
  state.press('plus');
  assert.equal(state.foundation.getEmittedValue(), '9007199254740993.2');
  state.press('minus');
  assert.equal(state.foundation.getEmittedValue(), '9007199254740993.1');
  assert.deepEqual(
    state.events.filter((event) => event[0] === 'update').map((event) => event[1]),
    ['9007199254740993.2', '9007199254740993.1'],
  );
  const scaled = setup({ stringMode: true, modelValue: '9007199254740993.10', step: 0.1 });
  scaled.press('plus');
  assert.equal(scaled.foundation.getEmittedValue(), '9007199254740993.20');
});

test('InputNumber parser/formatter replacement consumes the previous parser when raw text is unavailable', () => {
  const oldParser = (value: string) => value.replace('$', '');
  const state = setup({ defaultValue: 5, formatter: (value) => `$${value}`, parser: oldParser });
  assert.equal(state.raw(), '');
  state.options.parser = (value) => value.replace('€', '');
  state.options.formatter = (value) => `€${value}`;
  state.foundation.syncFormatting(state.options.formatter, oldParser);
  assert.equal(state.raw(), '5');
  assert.equal(state.inner(), '€5');
  assert.equal(state.foundation.getEmittedValue(), 5);
});

test('InputNumber draft input normalizes punctuation, rejects invalid text and commits once before blur', () => {
  const state = setup({ defaultValue: 1 });
  const input = new Event('input');
  state.foundation.handleInput(' 2。5 ', input);
  state.foundation.handleInput('invalid', input);
  assert.equal(state.inner(), '2.5');
  assert.equal(state.events.length, 1);
  const change = new Event('change');
  const blur = new Event('blur') as FocusEvent;
  state.foundation.handleChange(state.inner(), change);
  state.foundation.handleBlur(blur);
  assert.deepEqual(state.events, [
    ['input', 2.5, '2.5', input],
    ['update', 2.5],
    ['change', 2.5, change],
    ['blur', blur],
  ]);
});

test('InputNumber input-model mode publishes draft/model/change in order without duplicate blur changes', () => {
  const state = setup({ modelEvent: 'input' });
  const event = new Event('input');
  state.foundation.handleInput('3', event);
  state.foundation.handleBlur(new Event('blur') as FocusEvent);
  assert.deepEqual(state.events.slice(0, 3), [
    ['input', 3, '3', event],
    ['update', 3],
    ['change', 3, event],
  ]);
  assert.equal(state.events.filter((event) => event[0] === 'change').length, 1);
});

test('InputNumber step guards precede focus and preserve first/repeat timer delays and original event identity', () => {
  const state = setup({ defaultValue: 0, max: 3 });
  const event = state.press('plus', true);
  assert.equal(state.timers.values().next().value?.delay, 800);
  state.fireTimer();
  assert.equal(state.timers.values().next().value?.delay, 150);
  assert.equal(state.inner(), '2');
  assert.equal(state.events.find((row) => row[0] === 'repeat')?.[1], event);
  state.foundation.clearRepeatTimer();
  assert.equal(state.timers.size, 0);
  state.press('plus');
  assert.equal(state.max(), true);
  const count = state.events.length;
  state.press('plus', true);
  state.setDisabled(true);
  state.press('minus', true);
  assert.equal(state.events.length, count);
  assert.equal(state.timers.size, 0);
});

test('InputNumber repeat cleanup cancels pending dispatch and readonly steps never focus', () => {
  const state = setup({ defaultValue: 2 });
  state.press('plus', true);
  assert.equal(state.timers.size, 1);
  state.foundation.clearRepeatTimer();
  assert.equal(state.timers.size, 0);
  state.options.readonly = 'Readonly';
  const count = state.events.length;
  state.press('plus', true);
  assert.equal(state.events.length, count);
});

test('InputNumber keyboard preserves cancellation, modifiers, native preventDefault and readonly guards', () => {
  const state = setup({ defaultValue: 0.1, step: 0.2 });
  state.key('ArrowUp');
  assert.equal(state.inner(), '0.3');
  state.setCancelKey(true);
  state.key('ArrowDown');
  assert.equal(state.inner(), '0.3');
  state.setCancelKey(false);
  assert.equal(state.key('ArrowUp', { ctrlKey: true }).defaultPrevented, false);
  assert.equal(state.inner(), '0.3');
  state.options.readonly = true;
  assert.equal(state.key('ArrowDown').defaultPrevented, true);
  assert.equal(state.inner(), '0.3');
});

test('InputNumber boundary normalization preserves precision at min/max and updates status after bounds change', () => {
  const state = setup({ defaultValue: 0, min: 0.15, max: 1, step: 0.1, precision: 1 });
  state.foundation.syncBounds();
  assert.equal(state.inner(), '0.15');
  assert.equal(state.min(), true);
  state.foundation.handleInput('2', new Event('input'));
  state.foundation.handleChange(state.inner(), new Event('change'));
  assert.equal(state.inner(), '1.0');
  assert.equal(state.max(), true);
  state.options.max = 0.75;
  state.foundation.syncBounds();
  assert.equal(state.inner(), '0.75');
});

test('InputNumber clear publishes model/change/form/clear once and ignores the following empty click change', () => {
  const state = setup({ defaultValue: '2' });
  const event = new Event('click');
  state.foundation.handleClear(event);
  state.foundation.handleChange('', event);
  state.foundation.handleBlur(new Event('blur') as FocusEvent);
  assert.deepEqual(state.events.slice(0, 4), [
    ['update', ''],
    ['change', '', event],
    ['form', event],
    ['clear', event],
  ]);
  assert.equal(state.events.filter((row) => row[0] === 'change').length, 1);
});

test('InputNumber controlled synchronization distinguishes exact strings and switches legacy value modes', () => {
  const state = setup({ stringMode: true, modelValue: '9007199254740992' });
  state.options.modelValue = '9007199254740993';
  state.foundation.syncModel(state.options.modelValue);
  assert.equal(state.inner(), '9007199254740993');
  state.options.stringMode = false;
  state.options.modelValue = 4;
  state.foundation.syncModel(4);
  assert.equal(state.foundation.getEmittedValue(), 4);
  state.options.modelValue = '5';
  state.foundation.syncModel('5');
  assert.equal(state.foundation.getEmittedValue(), '5');
});
