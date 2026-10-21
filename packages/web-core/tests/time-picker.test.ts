import assert from 'node:assert/strict';
import { test } from 'node:test';

import type {
  TimePickerAdapter,
  TimeStateValue,
  TimeInputValue,
} from '../src/time-picker/foundation.ts';
import type { TimeListProps } from '../src/time-picker/options.ts';

import { dayjs } from '../dist/_utils/date.js';
import { createTimePickerFoundation } from '../dist/time-picker/foundation.js';
import {
  getTimeHours,
  getTimeMinutes,
  getTimeSeconds,
  getTimeAmpm,
} from '../dist/time-picker/options.js';
import {
  createTimeRangePanel,
  getSelectedTime,
  getSelectedTimeHour,
  getSelectedTimeAmpm,
} from '../dist/time-picker/panel.js';
import {
  getEmptyTimeValue,
  getInitialTimeValue,
  normalizeTimeValue,
} from '../dist/time-picker/state.js';
import {
  getColumnsFromFormat,
  getFormattedValue,
  isDisabledTimeValue,
  isValidInputValue,
  isValidRangeValue,
  resolveTimeFormat,
} from '../dist/time-picker/values.js';

const time = (value: string) => dayjs(value, 'HH:mm:ss');

function setup() {
  const state = {
    model: undefined as TimeStateValue,
    local: undefined as TimeStateValue,
    panel: undefined as TimeStateValue,
    input: undefined as TimeInputValue,
    visible: false,
    disabled: false,
    readonly: false,
    direct: false,
    range: false,
    focused: 0,
    reject: false,
  };
  const events: unknown[][] = [];
  const scheduled: Array<() => void> = [];
  const adapter: TimePickerAdapter = {
    getValue: () => state.model || state.local,
    getPanelValue: () => state.panel,
    getInputValue: () => state.input,
    getFormat: () => 'HH:mm:ss',
    getVisible: () => state.visible,
    getDisabled: () => state.disabled,
    getReadonly: () => state.readonly,
    getDisableConfirm: () => state.direct,
    getRange: () => state.range,
    getFocusedIndex: () => state.focused,
    setValue: (value) => {
      events.push(['local']);
      state.local = value;
    },
    setPanelValue: (value) => {
      events.push(['panel']);
      state.panel = value;
    },
    setInputValue: (value) => {
      events.push(['input', value]);
      state.input = value;
    },
    setVisible: (value) => {
      events.push(['visible', value]);
      state.visible = value;
    },
    setFocusedInputIndex: (index) => {
      events.push(['index', index]);
      state.focused = index;
    },
    isDisabledTime: () => state.reject,
    onUpdateValue: (value) => {
      events.push(['update', value, state.local]);
    },
    onChange: (value) => {
      events.push(['change', value]);
    },
    onSelect: (value) => {
      events.push(['select', value]);
    },
    onFormChange: () => {
      events.push(['form']);
    },
    onClear: () => {
      events.push(['clear']);
    },
    onPopupChange: (value) => {
      events.push(['popup', value]);
    },
    onUpdatePopup: (value) => {
      events.push(['updatePopup', value]);
    },
    focusInput: (index) => {
      events.push(['focus', index]);
    },
    afterRender: (task) => {
      scheduled.push(task);
    },
  };
  return { state, events, scheduled, adapter, foundation: createTimePickerFoundation(adapter) };
}

test('time formats ignore escaped tokens, choose fallbacks and preserve exact input parsing', () => {
  assert.deepEqual(getColumnsFromFormat('[Hours] mm [A] ss'), {
    list: ['m', 's'],
    use12Hours: false,
  });
  assert.equal(resolveTimeFormat('[text]', undefined, true), 'hh:mm:ss a');
  assert.equal(resolveTimeFormat(undefined, 'HH:mm'), 'HH:mm');
  assert.equal(isValidInputValue('09:01:02', 'HH:mm:ss'), true);
  assert.equal(isValidInputValue('9:01:02', 'HH:mm:ss'), false);
  assert.equal(isValidInputValue('25:01:02', 'HH:mm:ss'), false);
  assert.equal(isValidInputValue('', 'HH:mm:ss'), false);
  assert.deepEqual(getFormattedValue([time('01:02:03'), undefined], 'HH:mm'), ['01:02', undefined]);
  assert.equal(isValidRangeValue([time('01:00:00'), undefined]), false);
  assert.equal(isValidRangeValue([]), true);
  assert.equal(isValidRangeValue(undefined), true);
});

test('time state preserves empty ranges, array identity and lazy fallback precedence', () => {
  const array = [0, '01:02:03'];
  assert.equal(normalizeTimeValue(array, true), array);
  assert.deepEqual(normalizeTimeValue(0, true), [0, undefined]);
  assert.equal(normalizeTimeValue(0, false), 0);
  assert.equal(normalizeTimeValue(undefined, true), undefined);
  assert.deepEqual(getEmptyTimeValue(true), []);
  assert.equal(getEmptyTimeValue(false), undefined);
  const model = time('01:00:00');
  assert.equal(
    getInitialTimeValue(
      model,
      () => {
        throw new Error('default read too early');
      },
      true,
    ),
    model,
  );
  assert.deepEqual(
    getInitialTimeValue(undefined, () => undefined, true),
    [],
  );
});

test('time columns preserve 12-hour disabled callback arguments and per-column evaluation', () => {
  const calls: unknown[][] = [];
  const props: TimeListProps = {
    format: 'hh:mm:ss A',
    use12Hours: true,
    hideDisabledOptions: true,
    step: { hour: 3, minute: 15, second: 30 },
    selectedHour: 12,
    selectedMinute: 15,
    selectedSecond: 30,
    selectedAmpm: 'pm',
    disabledHours: () => {
      calls.push(['hours']);
      return [15];
    },
    disabledMinutes: (hour) => {
      calls.push(['minutes', hour]);
      return [30];
    },
    disabledSeconds: (hour, minute) => {
      calls.push(['seconds', hour, minute]);
      return [0];
    },
  };
  assert.deepEqual(
    getTimeHours(props).map((item) => item.value),
    [12, 6, 9],
  );
  assert.deepEqual(calls, [['hours']]);
  assert.deepEqual(
    getTimeMinutes(props).map((item) => item.value),
    [0, 15, 45],
  );
  assert.deepEqual(
    getTimeSeconds(props).map((item) => item.value),
    [30],
  );
  assert.deepEqual(calls, [['hours'], ['minutes', 12], ['seconds', 12, 15]]);
  assert.deepEqual(
    getTimeAmpm(props).map((item) => item.label),
    ['AM', 'PM'],
  );
  props.selectedAmpm = 'am';
  props.step = { hour: 0, minute: -1, second: Number.NaN };
  assert.equal(getTimeHours(props).length, 12);
  assert.equal(getTimeMinutes(props).length, 59);
  props.disabled = true;
  assert.ok(getTimeSeconds(props).every((item) => item.disabled));
  getTimeMinutes(props);
  assert.deepEqual(calls.at(-1), ['minutes', 0]);
});

test('disabled time evaluates all unit lists in order and stops range checks at the first disabled item', () => {
  const calls: unknown[][] = [];
  const options = {
    disabledHours: () => {
      calls.push(['hour']);
      return [12];
    },
    disabledMinutes: (hour?: number) => {
      calls.push(['minute', hour]);
      return [];
    },
    disabledSeconds: (hour?: number, minute?: number) => {
      calls.push(['second', hour, minute]);
      return [];
    },
  };
  assert.equal(isDisabledTimeValue([undefined, time('12:34:56'), time('13:00:00')], options), true);
  assert.deepEqual(calls, [['hour'], ['minute', 12], ['second', 12, 34]]);
});

test('panel unit selection preserves midnight, noon and 12-hour conversion', () => {
  assert.equal(getSelectedTimeHour(time('00:34:56'), true), 12);
  assert.equal(getSelectedTimeHour(time('13:34:56'), true), 1);
  assert.equal(getSelectedTimeAmpm(time('12:00:00')), 'pm');
  assert.equal(getSelectedTime(time('13:34:56'), 2, 'hour', true).format('HH:mm:ss'), '14:34:56');
  assert.equal(
    getSelectedTime(time('00:34:56'), 'pm', 'ampm', true).format('HH:mm:ss'),
    '12:34:56',
  );
  assert.equal(getSelectedTime(undefined, 9, 'minute', false).format('HH:mm:ss'), '00:09:00');
});

test('time confirmation emits before local writes and preserves declined controlled values', () => {
  const { state, events, foundation } = setup();
  const old = time('01:00:00');
  state.model = old;
  foundation.onPanelConfirm(time('02:00:00'));
  assert.deepEqual(
    events.map((event) => event[0]),
    ['update', 'change', 'form', 'local'],
  );
  assert.equal(events[0][2], undefined);
  assert.equal(state.model, old);
  events.length = 0;
  foundation.onPanelConfirm(old);
  assert.deepEqual(events, [['local']]);
});

test('panel selection precedes direct confirmation; popup opening schedules current focus', () => {
  const { state, events, scheduled, foundation } = setup();
  state.direct = true;
  foundation.onPanelSelect(time('03:04:05'));
  assert.deepEqual(
    events.map((event) => event[0]),
    ['select', 'update', 'change', 'form', 'local', 'visible', 'popup', 'updatePopup'],
  );
  events.length = 0;
  foundation.onPanelVisibleChange(true);
  state.focused = 1;
  scheduled[0]();
  assert.deepEqual(events, [['focus', 1]]);
});

test('range confirmation sorts clock times on today and retains empty clear and readonly guard semantics', () => {
  const { state, events, foundation } = setup();
  state.range = true;
  const input = [dayjs('2001-01-01 12:00:00'), dayjs('2002-02-02 01:00:00')];
  foundation.onPanelConfirm(input);
  assert.deepEqual(getFormattedValue(state.local, 'HH:mm:ss'), ['01:00:00', '12:00:00']);
  assert.equal(input[0].year(), 2001);
  events.length = 0;
  state.readonly = true;
  foundation.onClear();
  assert.deepEqual(events, [['panel'], ['clear']]);
  state.readonly = false;
  foundation.onPanelConfirm([]);
  assert.equal(state.local, undefined);
});

test('incomplete range enter advances focus and invalid or disabled input keeps draft text', () => {
  const { state, events, foundation } = setup();
  state.range = true;
  state.panel = [time('01:02:03'), undefined];
  foundation.onRangeInputPressEnter();
  assert.deepEqual(events, [
    ['index', 1],
    ['focus', 1],
  ]);
  events.length = 0;
  foundation.onRangeInputChange('bad');
  assert.deepEqual(state.input, ['01:02:03', 'bad']);
  assert.equal(
    events.some((event) => event[0] === 'select'),
    false,
  );
  state.reject = true;
  foundation.onRangeInputChange('04:05:06');
  assert.equal(
    events.some((event) => event[0] === 'select'),
    false,
  );
  state.reject = false;
  state.direct = true;
  foundation.onRangeInputChange('04:05:06');
  assert.deepEqual(getFormattedValue(state.local, 'HH:mm:ss'), ['01:02:03', '04:05:06']);
});

test('range panel routes incomplete confirmation to the other input and preserves event order', () => {
  let value: TimeStateValue = [time('01:00:00')];
  let index = 0;
  const events: unknown[][] = [];
  const panel = createTimeRangePanel({
    getValue: () => (Array.isArray(value) ? value : undefined),
    getIndex: () => index,
    setIndex: (next) => {
      index = next;
      events.push(['localIndex', next]);
    },
    onIndexChange: (next) => {
      events.push(['indexChange', next]);
    },
    onUpdateIndex: (next) => {
      events.push(['updateIndex', next]);
    },
    onSelect: (next) => {
      events.push(['select', next]);
      value = next;
    },
    onConfirm: (next) => {
      events.push(['confirm', next]);
    },
  });
  panel.confirm();
  assert.deepEqual(events, [
    ['localIndex', 1],
    ['indexChange', 1],
    ['updateIndex', 1],
  ]);
  panel.select(time('02:00:00'));
  panel.confirm();
  assert.equal(events.at(-1)?.[0], 'confirm');
});
