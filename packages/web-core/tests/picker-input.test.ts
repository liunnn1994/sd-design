import dayjs from 'dayjs';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createPickerRangeInputFoundation,
  resolvePickerInputValue,
  type PickerRangeInputState,
} from '../dist/picker/input.js';

test('single picker explicit empty draft bypasses both date and format reads', () => {
  assert.equal(
    resolvePickerInputValue({
      inputValue: '',
      get value() {
        throw new Error('date should be inert');
      },
      get format() {
        throw new Error('format should be inert');
      },
    }),
    '',
  );
});

test('single picker rejects native dates without reading a formatter', () => {
  for (const value of [undefined, null, new Date(), {}]) {
    assert.equal(
      resolvePickerInputValue({
        value: value as never,
        get format() {
          throw new Error('format should be inert');
        },
      }),
      undefined,
    );
  }
});

test('single picker formats Dayjs values or passes their original identity to callbacks', () => {
  const value = dayjs('2024-02-29T12:34:56');
  assert.equal(resolvePickerInputValue({ value, format: 'YYYY/MM/DD' }), '2024/02/29');
  assert.equal(
    resolvePickerInputValue({
      value,
      format: (received) => {
        assert.equal(received, value);
        return '';
      },
    }),
    '',
  );
});

function rangeFixture() {
  const events: unknown[][] = [];
  const input = (index: number) =>
    ({
      focus() {
        assert.equal(this, state.inputs[index]);
        events.push(['focus', index]);
      },
      blur() {
        assert.equal(this, state.inputs[index]);
        events.push(['blur', index]);
      },
    }) as HTMLInputElement;
  const state: { -readonly [Key in keyof PickerRangeInputState]: PickerRangeInputState[Key] } = {
    mergedDisabled: false,
    disabled: false,
    focusedIndex: undefined,
    inputValue: undefined,
    value: [dayjs('2024-01-02'), dayjs('2024-03-04')],
    format: 'YYYY/MM/DD',
    inputs: [input(0), input(1)],
    emitFocusedIndexChange: (index) => events.push(['focused-index-change', index]),
    emitUpdateFocusedIndex: (index) => events.push(['update:focusedIndex', index]),
  };
  return { state, events, controller: createPickerRangeInputFoundation(state) };
}

test('range picker keeps sparse and empty draft arrays authoritative on both sides', () => {
  const { state, controller } = rangeFixture();
  for (const draft of [[], [undefined], ['', 'draft']]) {
    state.inputValue = draft;
    Object.defineProperty(state, 'value', {
      configurable: true,
      get() {
        throw new Error('date read');
      },
    });
    Object.defineProperty(state, 'format', {
      configurable: true,
      get() {
        throw new Error('format read');
      },
    });
    assert.equal(controller.getDisplayValue(0), draft[0]);
    assert.equal(controller.getDisplayValue(1), draft[1]);
  }
});

test('range picker reads live values and format after drafts are released', () => {
  const { state, controller } = rangeFixture();
  state.inputValue = ['draft'];
  assert.equal(controller.getDisplayValue(0), 'draft');
  state.inputValue = undefined;
  assert.equal(controller.getDisplayValue(0), '2024/01/02');
  state.format = (value) => value.format('MM-DD');
  assert.equal(controller.getDisplayValue(1), '03-04');
  state.value = [];
  assert.equal(controller.getDisplayValue(1), undefined);
});

test('merged disabled wins without reading local disabled, then falls back to individual sides', () => {
  const { state, controller } = rangeFixture();
  state.mergedDisabled = true;
  Object.defineProperty(state, 'disabled', {
    configurable: true,
    get() {
      throw new Error('local read');
    },
  });
  assert.equal(controller.getDisabled(0), true);
  Object.defineProperty(state, 'disabled', {
    configurable: true,
    writable: true,
    value: [false, true],
  });
  state.mergedDisabled = false;
  assert.equal(controller.getDisabled(0), false);
  assert.equal(controller.getDisabled(1), true);
  state.disabled = [];
  assert.equal(controller.getDisabled(0), undefined);
});

test('range focus uses the controlled index, blocks disabled sides and accepts explicit zero', () => {
  const { state, events, controller } = rangeFixture();
  controller.focus();
  assert.deepEqual(events, []);
  state.focusedIndex = 1;
  controller.focus();
  controller.focus(0);
  state.disabled = [true, false];
  controller.focus(0);
  state.mergedDisabled = true;
  controller.focus(1);
  assert.deepEqual(events, [
    ['focus', 1],
    ['focus', 0],
  ]);
});

test('range focus retains numeric-index semantics and missing native methods are inert', () => {
  const { state, events, controller } = rangeFixture();
  state.focusedIndex = 0;
  controller.focus(Number.NaN);
  controller.focus(7);
  assert.deepEqual(events, [
    ['focus', 0],
    ['focus', 1],
  ]);
  state.inputs = [undefined, {} as HTMLInputElement];
  controller.focus(0);
  controller.focus(1);
  controller.blur();
  assert.equal(events.length, 2);
});

test('range blur follows current index independently of disabled and preserves the undefined fallback', () => {
  const { state, events, controller } = rangeFixture();
  state.mergedDisabled = true;
  controller.blur();
  state.focusedIndex = 0;
  controller.blur();
  assert.deepEqual(events, [
    ['blur', 1],
    ['blur', 0],
  ]);
});

test('focused-index notification order and controlled ownership remain unchanged', () => {
  const { state, events, controller } = rangeFixture();
  controller.changeFocusedInput(1);
  assert.deepEqual(events, [
    ['focused-index-change', 1],
    ['update:focusedIndex', 1],
  ]);
  assert.equal(state.focusedIndex, undefined);
});
