import type { Dayjs } from 'dayjs';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { DateHeaderMode, DatePickerAdapter } from '../src/date-picker/foundation.ts';
import type { DateRangeAdapter, DateRangeValue } from '../src/date-picker/range-foundation.ts';

import { dayjs, getDayjsValue } from '../dist/_utils/date.js';
import {
  getDateRows,
  getDateWeekList,
  getMonthRows,
  getQuarterRows,
  getYearRows,
  getYearHeaderTitle,
} from '../dist/date-picker/calendar.js';
import { getDateCellClassName } from '../dist/date-picker/cells.js';
import { isDatePickerDisabled } from '../dist/date-picker/disabled.js';
import { getDefaultFormat, getDefaultValueFormat } from '../dist/date-picker/format.js';
import { createDatePickerFoundation } from '../dist/date-picker/foundation.js';
import {
  createDateHeader,
  fixRangeHeaders,
  getPanelSpan,
  getPanelSuperSpan,
  rangeHeaderOperationKeys,
  setDateRangeHeader,
} from '../dist/date-picker/header.js';
import {
  createDateRangeFoundation,
  getDateRangeDisabled,
  getDateRangeFocusedIndex,
  getDateRangeNextIndex,
} from '../dist/date-picker/range-foundation.js';
import {
  isDisabledDate,
  isCompleteRangeValue,
  isValidRangeValue,
  normalizeRangeValue,
} from '../dist/date-picker/utils.js';
import {
  getDateShortcutValue,
  getRangeDateShortcutValue,
  getInitialDateValue,
  getReturnValue,
  getReturnRangeValue,
} from '../dist/date-picker/values.js';

const date = (value: string) => dayjs(value);
const formatted = (value: DateRangeValue | undefined) =>
  value?.map((item) => item?.format('YYYY-MM-DD HH:mm:ss'));

function single() {
  const state = {
    selected: undefined as Dayjs | undefined,
    model: undefined as Dayjs | undefined,
    process: undefined as Dayjs | undefined,
    preview: undefined as Dayjs | undefined,
    input: undefined as string | undefined,
    header: date('2024-02-01'),
    headerMode: undefined as DateHeaderMode,
    time: date('2024-01-01 09:30:00'),
    disabled: false,
    readonly: false,
    visible: false,
    confirm: false,
    showTime: false,
    reject: false,
    utcOffset: undefined as number | undefined,
  };
  const events: unknown[][] = [];
  const tasks: Array<() => void> = [];
  const adapter: DatePickerAdapter<{ id: number }> = {
    getSelectedValue: () => state.model || state.selected,
    getPanelValue: () => state.preview ?? state.process ?? state.model ?? state.selected,
    getHeaderValue: () => state.header,
    getTimeValue: () => state.time,
    getFormat: () => 'YYYY-MM-DD',
    getParseFormat: () => 'YYYY-MM-DD',
    getReturnFormat: () => 'YYYY-MM-DD',
    getUtcOffset: () => state.utcOffset,
    getTimezone: () => undefined,
    getMode: () => 'date',
    getHeaderMode: () => state.headerMode,
    getVisible: () => state.visible,
    getDisabled: () => state.disabled,
    getReadonly: () => state.readonly,
    getIsDateTime: () => state.showTime,
    getHasTimePickerProps: () => false,
    getNeedConfirm: () => state.confirm,
    setSelectedValue: (value) => {
      events.push(['selected']);
      state.selected = value;
    },
    setProcessValue: (value) => {
      events.push(['process']);
      state.process = value;
    },
    setPreviewValue: (value) => {
      events.push(['preview']);
      state.preview = value;
    },
    setInputValue: (value) => {
      events.push(['input']);
      state.input = value;
    },
    setHeaderValue: (value) => {
      state.header = value;
    },
    setHeaderMode: (value) => {
      events.push(['headerMode', value]);
      state.headerMode = value;
    },
    setVisible: (value) => {
      state.visible = value;
    },
    resetHeaderValue: () => {
      events.push(['resetHeader']);
    },
    resetTimeValue: () => {
      events.push(['resetTime']);
    },
    isDisabledDate: () => state.reject,
    onUpdateValue: (value) => {
      events.push(['update', value, state.selected]);
    },
    onChange: (value) => {
      events.push(['change', value]);
    },
    onSelect: (value) => {
      events.push(['select', value]);
    },
    onOk: (value) => {
      events.push(['ok', value]);
    },
    onClear: () => {
      events.push(['clear']);
    },
    onShortcut: (value) => {
      events.push(['shortcut', value]);
    },
    onFormChange: () => {
      events.push(['form']);
    },
    onPopupChange: (value) => {
      events.push(['popup', value]);
    },
    onUpdatePopup: (value) => {
      events.push(['updatePopup', value]);
    },
    cancelPreviewClear: () => {
      events.push(['cancel']);
    },
    schedulePreviewClear: (task) => {
      tasks.push(task);
    },
  };
  return { state, events, tasks, adapter, foundation: createDatePickerFoundation(adapter) };
}

function range() {
  const state = {
    selected: [] as DateRangeValue,
    model: undefined as DateRangeValue | undefined,
    process: undefined as DateRangeValue | undefined,
    preview: undefined as DateRangeValue | undefined,
    input: undefined as Array<string | undefined> | undefined,
    time: [date('2024-01-01 09:00:00'), date('2024-01-01 18:00:00')],
    focused: 0,
    disabledInputs: [false, false],
    disabled: false,
    readonly: false,
    visible: false,
    confirm: false,
    hasTime: false,
    exchangeTime: true,
    fixedTime: false,
    reselect: true,
  };
  const events: unknown[][] = [];
  const tasks: Array<() => void> = [];
  const checked: unknown[][] = [];
  const adapter: DateRangeAdapter<{ id: number }> = {
    get selectedValue() {
      return state.model || state.selected;
    },
    get processValue() {
      return state.process;
    },
    get panelValue() {
      return state.preview ?? state.process ?? state.model ?? state.selected;
    },
    get inputValue() {
      return state.input;
    },
    get timeValue() {
      return state.time;
    },
    get focusedIndex() {
      return state.focused;
    },
    get nextFocusedIndex() {
      return getDateRangeNextIndex(state.disabledInputs, state.focused);
    },
    get isNextDisabled() {
      return state.disabledInputs[state.focused ^ 1];
    },
    get disabled() {
      return state.disabled;
    },
    get disabledInputs() {
      return state.disabledInputs;
    },
    get readonly() {
      return state.readonly;
    },
    get visible() {
      return state.visible;
    },
    get needConfirm() {
      return state.confirm;
    },
    get hasTime() {
      return state.hasTime;
    },
    get exchangeTime() {
      return state.exchangeTime;
    },
    get fixedTime() {
      return state.fixedTime;
    },
    get clearRangeOnReselect() {
      return state.reselect;
    },
    utcOffset: undefined,
    timezone: undefined,
    returnFormat: 'YYYY-MM-DD HH:mm:ss',
    parseFormat: 'YYYY-MM-DD HH:mm:ss',
    format: 'YYYY-MM-DD HH:mm:ss',
    setSelectedValue: (value) => {
      events.push(['selected']);
      state.selected = value;
    },
    setProcessValue: (value) => {
      events.push(['process']);
      state.process = value;
    },
    setPreviewValue: (value) => {
      events.push(['preview']);
      state.preview = value;
    },
    setInputValue: (value) => {
      events.push(['input']);
      state.input = value;
    },
    setTimePickerValue: (value) => {
      state.time = value;
    },
    setFocusedIndex: (value) => {
      state.focused = value;
      events.push(['focusIndex', value]);
    },
    resetHeaderModes: () => {
      events.push(['headerModes']);
    },
    resetHeaderValue: () => {
      events.push(['resetHeader']);
    },
    resetTimeValue: () => {
      events.push(['resetTime']);
    },
    focusInput: (value) => {
      events.push(['focus', value]);
    },
    afterRender: (task) => {
      tasks.push(task);
    },
    setVisible: (value) => {
      state.visible = value;
    },
    isDisabledDate: (value, type) => {
      checked.push([value?.format('YYYY-MM-DD HH:mm:ss'), type]);
      return false;
    },
    onUpdateValue: (value) => {
      events.push(['update', value]);
    },
    onChange: (value) => {
      events.push(['change', value]);
    },
    onOk: (value) => {
      events.push(['ok', value]);
    },
    onSelect: (value) => {
      events.push(['select', value]);
    },
    onShortcut: (value) => {
      events.push(['shortcut', value]);
    },
    onClear: () => {
      events.push(['clear']);
    },
    onFormChange: () => {
      events.push(['form']);
    },
    onPopupChange: (value) => {
      events.push(['popup', value]);
    },
    onUpdatePopup: (value) => {
      events.push(['updatePopup', value]);
    },
    cancelPreviewClear: () => {
      events.push(['cancel']);
    },
    schedulePreviewClear: (task) => {
      tasks.push(task);
    },
  };
  return { state, events, checked, tasks, adapter, foundation: createDateRangeFoundation(adapter) };
}

test('date values preserve epoch, partial-range predicates, default precedence and separate week formats', () => {
  assert.equal(normalizeRangeValue(0)?.[0], 0);
  const values = [date('2024-01-01'), undefined];
  const raw = ['2024-01-01', undefined];
  assert.equal(normalizeRangeValue(raw), raw);
  assert.equal(isCompleteRangeValue(values), false);
  assert.equal(isValidRangeValue(values), false);
  assert.equal(isValidRangeValue(undefined), true);
  assert.equal(isValidRangeValue([]), true);
  assert.equal(
    getInitialDateValue(
      0,
      () => {
        throw new Error('default was read');
      },
      -1,
    ),
    0,
  );
  assert.equal(getReturnValue(dayjs(0), 'timestamp'), 0);
  assert.ok(getReturnValue(dayjs(0), 'Date') instanceof Date);
  assert.deepEqual(getReturnRangeValue([dayjs(0), undefined], 'timestamp'), [0, undefined]);
  assert.equal(getDefaultFormat('week'), 'gggg-wo');
  assert.equal(getDefaultValueFormat('week'), 'YYYY-MM-DD');
  assert.equal(getDefaultValueFormat('quarter'), 'YYYY-MM');
});

test('period disabling checks every day until the first enabled date and respects range callback type', () => {
  const checked: number[] = [];
  assert.equal(
    isDisabledDate(
      date('2024-02-15'),
      (value) => {
        checked.push(value.getDate());
        return value.getDate() !== 29;
      },
      'month',
    ),
    false,
  );
  assert.equal(checked.length, 29);
  const types: string[] = [];
  assert.equal(
    isDatePickerDisabled(
      date('2024-01-01'),
      {
        mode: 'date',
        isRange: true,
        disabledDate: (_value, type) => {
          types.push(type);
          return true;
        },
      },
      'end',
    ),
    true,
  );
  assert.deepEqual(types, ['end']);
  assert.equal(isDatePickerDisabled(undefined, { mode: 'date' }), undefined);
  const units: string[] = [];
  assert.equal(
    isDatePickerDisabled(date('2024-01-01 12:34:56'), {
      mode: 'date',
      showTime: true,
      disabledTime: () => ({
        disabledHours: () => {
          units.push('h');
          return [12];
        },
        disabledMinutes: () => {
          units.push('m');
          return [];
        },
      }),
    }),
    true,
  );
  assert.deepEqual(units, ['h']);
});

test('calendar cells preserve week starts, hidden adjacent dates, localized months and decade boundaries', () => {
  assert.deepEqual(getDateWeekList(1), [1, 2, 3, 4, 5, 6, 0]);
  const rows = getDateRows({
    headerValue: date('2024-02-15'),
    weekList: getDateWeekList(1),
    isWeek: true,
    hideNotInViewDates: true,
    prefixCls: 'p',
  });
  assert.equal(rows.length, 6);
  assert.equal(rows[0].length, 8);
  assert.equal(rows[0][1].value.format('YYYY-MM-DD'), '2024-01-29');
  assert.equal(rows[0][1].classNames, 'p-cell-hidden');
  assert.equal(rows[0][0].value, rows[0][1].value);
  const month = getMonthRows(date('2024-02-15'), false, (key) => key);
  assert.equal(month[0][0].label, 'datePicker.month.long.January');
  assert.equal(month[3][2].value.month(), 11);
  assert.equal(getQuarterRows(date('2024-02-15'))[0][3].value.month(), 9);
  assert.equal(getYearHeaderTitle(date('2024-02-15')), '2020-2029');
  assert.equal(getYearRows(date('2024-02-15'))[0][0].isPrev, true);
});

test('cell range flags read current bounds after custom selection comparisons', () => {
  const current = date('2024-02-15');
  let start = date('2024-02-01');
  const result = getDateCellClassName(
    {
      prefixCls: 'p',
      value: current,
      now: current,
      isSameTime: (a, b) => {
        start = current;
        return a.isSame(b, 'date');
      },
    },
    { value: current, label: 15 },
    false,
    {
      get start() {
        return start;
      },
      end: date('2024-02-20'),
    },
  );
  assert.equal((result[1] as Record<string, unknown>)['p-cell-range-start'], true);
});

test('date headers retain minimum-year guards, dynamic operation reads and paired emission order', () => {
  let value = date('2024-02-01');
  const events: string[] = [];
  const header = createDateHeader({
    mode: 'date',
    get value() {
      return value;
    },
    span: 1,
    superSpan: 12,
    setLocalValue: (next) => {
      events.push('local');
      value = next;
    },
    onChange: () => {
      events.push('change');
    },
  });
  const next = header.getOperations().onNext;
  value = date('2025-05-01');
  next?.();
  assert.equal(value.format('YYYY-MM'), '2025-06');
  assert.deepEqual(events, ['change', 'local']);
  value = date('2024-01-01').year(0);
  assert.equal(header.getOperations().onPrev, undefined);
  assert.equal(header.getOperations().onSuperPrev, undefined);
  const fixed = fixRangeHeaders([date('2024-02-20'), date('2024-02-01')], 1, 'date');
  assert.deepEqual(
    fixed.map((item) => item.format('YYYY-MM-DD')),
    ['2024-02-01', '2024-03-01'],
  );
  assert.equal(getPanelSpan('year'), 120);
  assert.equal(getPanelSuperSpan('month'), 12);
  assert.deepEqual(rangeHeaderOperationKeys('date', true, false, true), [
    'onSuperNext',
    'onNext',
    'onPrev',
  ]);
  events.length = 0;
  setDateRangeHeader(
    {
      mode: 'date',
      start: date('2024-01-01'),
      end: date('2024-02-01'),
      setStart: () => {
        events.push('start');
      },
      setEnd: () => {
        events.push('end');
      },
      onChange: () => {
        events.push('change');
      },
    },
    [date('2025-01-01'), date('2025-02-01')],
  );
  assert.deepEqual(events, ['start', 'end', 'change']);
});

test('shortcut factories resolve values on every call and honor parsing format', () => {
  let calls = 0;
  const shortcut = {
    value: () => {
      calls++;
      return '2024/02/15';
    },
    format: 'YYYY/MM/DD',
  };
  assert.equal(getDateShortcutValue(shortcut, 'YYYY-MM-DD').date(), 15);
  assert.equal(getRangeDateShortcutValue(shortcut, 'YYYY-MM-DD')[0]?.date(), 15);
  assert.equal(calls, 2);
});

test('single date confirmation emits model/change/form/ok before state writes and retains controlled value', () => {
  const { state, events, foundation } = single();
  state.model = date('2024-01-01');
  state.process = date('2024-02-15');
  foundation.onPanelConfirm();
  assert.deepEqual(
    events.map((item) => item[0]),
    ['update', 'change', 'form', 'ok', 'selected', 'process', 'preview', 'input', 'headerMode'],
  );
  assert.equal(events[0][2], undefined);
  assert.equal(state.model.format('YYYY-MM-DD'), '2024-01-01');
  events.length = 0;
  state.process = undefined;
  foundation.onPanelConfirm();
  assert.equal(events[0][0], 'ok');
  assert.equal(
    events.some((item) => item[0] === 'change'),
    false,
  );
});

test('single date input keeps invalid drafts but clears accepted confirmation drafts and rejects disabled dates', () => {
  const { state, events, foundation } = single();
  foundation.onInputChange('bad');
  assert.equal(state.input, 'bad');
  assert.equal(state.visible, true);
  state.reject = true;
  foundation.onInputChange('2024-02-15');
  assert.equal(state.input, '2024-02-15');
  assert.equal(state.selected, undefined);
  state.reject = false;
  foundation.onInputChange('2024-02-15');
  assert.equal(state.input, undefined);
  assert.equal(state.selected?.date(), 15);
  state.confirm = true;
  events.length = 0;
  foundation.onInputChange('2024-02-16');
  assert.equal(state.process?.date(), 16);
  assert.equal(
    events.some((item) => item[0] === 'update'),
    false,
  );
});

test('single date shortcut selection, lock guards and clear keep their original order', () => {
  const { state, events, tasks, foundation } = single();
  foundation.onPanelShortcutMouseEnter(date('2024-02-15'));
  assert.deepEqual(
    events.map((item) => item[0]),
    ['cancel', 'preview', 'input'],
  );
  foundation.onPanelShortcutMouseLeave();
  tasks[0]();
  assert.equal(state.preview, undefined);
  events.length = 0;
  foundation.onPanelShortcutClick(date('2024-02-15'), { id: 1 });
  assert.deepEqual(
    events.slice(0, 4).map((item) => item[0]),
    ['shortcut', 'update', 'change', 'form'],
  );
  state.readonly = true;
  events.length = 0;
  foundation.onInputClear();
  assert.deepEqual(events, [['clear']]);
});

test('single date model and visibility synchronization preserve reset differences', () => {
  const { events, foundation } = single();
  foundation.onModelChange();
  assert.deepEqual(
    events.map((item) => item[0]),
    ['process', 'preview', 'input'],
  );
  events.length = 0;
  foundation.onVisibilityChange(true);
  assert.deepEqual(
    events.map((item) => item[0]),
    ['process', 'preview', 'headerMode', 'resetHeader', 'resetTime'],
  );
  events.length = 0;
  foundation.onVisibilityChange(false);
  assert.deepEqual(
    events.map((item) => item[0]),
    ['process', 'preview', 'headerMode', 'input'],
  );
});

test('single date UTC input conversion uses shared parser and local return format', () => {
  const { state, adapter, foundation, events } = single();
  state.utcOffset = 8;
  foundation.onInputChange('2024-02-15');
  assert.equal(state.selected?.valueOf(), getDayjsValue('2024-02-15', 'YYYY-MM-DD', 8)?.valueOf());
  assert.equal(events.find((event) => event[0] === 'update')?.[1], '2024-02-15');
  assert.equal(adapter.getUtcOffset(), 8);
});

test('range validation runs against sorted endpoints before any update', () => {
  const { state, checked, events, adapter, foundation } = range();
  state.process = [date('2024-02-20'), date('2024-02-01')];
  adapter.isDisabledDate = (value, type) => {
    checked.push([value?.date(), type]);
    return type === 'start' && value?.date() === 1;
  };
  foundation.onPanelConfirm();
  assert.deepEqual(checked, [[1, 'start']]);
  assert.deepEqual(events, []);
});

test('range exchangeTime=false preserves endpoint clock values while sorting dates', () => {
  const { state, foundation } = range();
  state.hasTime = true;
  state.exchangeTime = false;
  state.process = [date('2024-02-20 09:00:00'), date('2024-02-01 18:00:00')];
  foundation.onPanelConfirm();
  assert.deepEqual(formatted(state.selected), ['2024-02-01 09:00:00', '2024-02-20 18:00:00']);
});

test('range fixedTime retains the existing full-timestamp sort when exchangeTime is false', () => {
  const { state, foundation } = range();
  state.hasTime = true;
  state.exchangeTime = false;
  state.fixedTime = true;
  state.process = [date('2024-02-20 09:00:00'), date('2024-02-01 18:00:00')];
  foundation.onPanelConfirm();
  assert.deepEqual(formatted(state.selected), ['2024-02-01 18:00:00', '2024-02-20 09:00:00']);
});

test('locked range endpoints reject clear, preview and shortcut confirmation changes', () => {
  const { state, events, foundation } = range();
  state.selected = [date('2024-02-01'), date('2024-02-20')];
  state.disabledInputs = [true, false];
  foundation.onPanelShortcutMouseEnter([date('2024-02-02'), date('2024-02-21')]);
  assert.equal(state.preview, undefined);
  events.length = 0;
  foundation.onPanelShortcutClick([date('2024-02-02'), date('2024-02-21')], { id: 1 });
  assert.deepEqual(events, [['shortcut', { id: 1 }]]);
  events.length = 0;
  foundation.onInputClear();
  assert.deepEqual(events, [['clear']]);
});

test('range click retains a locked opposite endpoint and emits selection before confirmation', () => {
  const { state, events, foundation } = range();
  state.selected = [date('2024-02-01'), date('2024-02-20')];
  state.disabledInputs = [true, false];
  state.focused = 1;
  foundation.onPanelCellClick(date('2024-02-21'));
  assert.deepEqual(formatted(state.selected), ['2024-02-01 00:00:00', '2024-02-21 00:00:00']);
  assert.deepEqual(
    events.slice(0, 4).map((item) => item[0]),
    ['select', 'update', 'change', 'form'],
  );
});

test('range reselect starts fresh, optionally retains existing endpoints and advances focus', () => {
  const { state, foundation } = range();
  state.selected = [date('2024-02-01'), date('2024-02-20')];
  foundation.onPanelCellClick(date('2024-03-01'));
  assert.deepEqual(formatted(state.process), ['2024-03-01 00:00:00']);
  assert.equal(state.focused, 1);
  state.reselect = false;
  state.process = undefined;
  state.focused = 0;
  foundation.onPanelCellClick(date('2024-02-02'));
  assert.equal(state.selected[1]?.date(), 20);
});

test('range invalid input and incomplete enter retain drafts and route focus without committing', () => {
  const { state, events, foundation } = range();
  foundation.onInputChange('bad');
  assert.deepEqual(state.input, ['bad']);
  assert.equal(state.process, undefined);
  foundation.onInputChange('');
  assert.equal(state.input, undefined);
  foundation.onInputChange('2024-02-01 09:00:00');
  assert.equal(state.process?.[0]?.date(), 1);
  foundation.onInputPressEnter();
  assert.equal(state.focused, 1);
  assert.equal(
    events.some((item) => item[0] === 'update'),
    false,
  );
});

test('range time edits retain date slots and preview leave resets input and headers after scheduling', () => {
  const { state, events, tasks, foundation } = range();
  state.hasTime = true;
  state.confirm = true;
  state.selected = [date('2024-02-01'), date('2024-02-20')];
  state.time = [date('2024-02-01 09:00:00'), date('2024-02-20 18:00:00')];
  foundation.onTimePickerSelect(date('2024-02-01 10:00:00'), 'start');
  assert.equal(state.process?.[0]?.hour(), 10);
  assert.equal(events.at(-1)?.[0], 'select');
  foundation.onPanelShortcutMouseLeave();
  events.length = 0;
  tasks[0]();
  assert.deepEqual(
    events.map((item) => item[0]),
    ['preview', 'input', 'resetHeader'],
  );
});

test('range visibility uses current focus after render and disabled-focus helpers retain endpoint rules', () => {
  const { state, events, tasks, foundation } = range();
  assert.deepEqual(getDateRangeDisabled([true, false], false), [true, false]);
  assert.deepEqual(getDateRangeDisabled(false, true), [true, true]);
  assert.equal(getDateRangeFocusedIndex([true, false]), 1);
  foundation.onVisibilityChange(true);
  state.focused = 1;
  tasks[0]();
  assert.deepEqual(events.at(-1), ['focus', 1]);
  events.length = 0;
  foundation.onModelChange();
  assert.deepEqual(
    events.map((item) => item[0]),
    ['process', 'preview', 'input', 'resetHeader'],
  );
});
