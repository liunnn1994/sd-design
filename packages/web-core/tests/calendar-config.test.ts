import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CalendarConfigInput, CalendarConfigView } from '../dist/calendar/config.js';
import type { CalendarTexts } from '../dist/calendar/types.js';

import { dayjs } from '../dist/_utils/date.js';
import { createCalendarConfigRules } from '../dist/calendar/config.js';
import { defaults } from '../dist/calendar/constants.js';
import { createCalendarTexts, createCalendarTextsLoader } from '../dist/calendar/i18n.js';
import { createDateUtils } from '../dist/calendar/utils/date.js';

function setup(overrides: Partial<CalendarConfigInput> = {}, attrs: Record<string, unknown> = {}) {
  const props: CalendarConfigInput = {
    datePicker: false,
    sm: false,
    xs: false,
    hideWeekends: false,
    horizontal: false,
    editableEvents: false,
    eventCount: false,
    eventsOnMonthView: false,
    allDayEvents: false,
    time: true,
    timeAtCursor: false,
    ...overrides,
  };
  const view: CalendarConfigView = {
    id: 'week',
    isDay: false,
    isDays: false,
    isWeek: true,
    isMonth: false,
    isYear: false,
  };
  const rules: ReturnType<typeof createCalendarConfigRules> = createCalendarConfigRules(
    props,
    { dateUtils: createDateUtils(() => 'en'), view },
    {
      get availableViews(): Record<string, { cols: number; rows: number }> {
        return rules.availableViews();
      },
      get hideWeekdays() {
        return rules.hideWeekdays();
      },
      get rawSpecialHours() {
        return rules.rawSpecialHours();
      },
      get specialHours() {
        return rules.specialHours();
      },
    },
    attrs,
  );
  return { props, view, rules };
}

test('normal defaults share layout objects while horizontal overrides only days/week', () => {
  const { props, rules } = setup();
  const normal = rules.availableViews();
  assert.notEqual(normal, defaults.availableViews);
  assert.equal(normal.week, defaults.availableViews.week);
  assert.equal(rules.view(), 'week');
  props.horizontal = true;
  const horizontal = rules.availableViews();
  assert.deepEqual(horizontal.week, { rows: 7, cols: 1 });
  assert.equal(horizontal.month, defaults.availableViews.month);
  assert.deepEqual(defaults.availableViews.week, { cols: 7, rows: 1 });
});

test('date-picker defaults copy layouts and preserve explicit navigation opt-out', () => {
  const { props, rules } = setup({ datePicker: true });
  const views = rules.availableViews();
  assert.deepEqual(Object.keys(views), ['month', 'year', 'years']);
  assert.notEqual(views.month, defaults.availableViews.month);
  assert.equal(rules.defaultView(), 'month');
  assert.equal(rules.view(), 'month');
  assert.equal(rules.xs(), true);
  assert.equal(rules.clickToNavigate(), true);
  props.clickToNavigate = false;
  assert.equal(rules.clickToNavigate(), false);
  props.sm = true;
  assert.equal(rules.sm(), true);
  props.xs = true;
  assert.equal(rules.sm(), false);
});

test('view list order, explicit view, invalid warnings and empty fallback retain behavior', (t) => {
  const warning = t.mock.method(console, 'warn', () => {});
  const { props, rules } = setup({ views: ['year', 'bogus', 'day'] });
  assert.deepEqual(Object.keys(rules.availableViews()), ['year', 'day']);
  assert.equal(warning.mock.callCount(), 1);
  assert.equal(rules.defaultView(), 'year');
  props.view = 'day';
  assert.equal(rules.view(), 'day');
  props.view = 'week';
  assert.equal(rules.view(), 'year');
  assert.ok(
    warning.mock.calls.some((call) => /first available view/.test(String(call.arguments[0]))),
  );
  props.views = [];
  assert.deepEqual(rules.availableViews(), defaults.availableViews);
});

test('custom sizes keep zero fallback and do not flip explicit horizontal layouts', () => {
  const { rules } = setup({
    horizontal: true,
    views: { days: { cols: 0, rows: 2 }, month: { cols: 4 } },
  });
  assert.deepEqual(rules.availableViews(), {
    days: { cols: 10, rows: 2 },
    month: { cols: 4, rows: 6 },
  });
});

test('invalid object view keys are ignored with the same fallback as invalid view lists', (t) => {
  t.mock.method(console, 'warn', () => {});
  const { props, rules } = setup({ views: { bogus: {}, day: { rows: 2 } } });
  assert.deepEqual(rules.availableViews(), { day: { cols: 1, rows: 2 } });
  props.views = { bogus: {} };
  assert.deepEqual(rules.availableViews(), defaults.availableViews);
  props.views = ['toString', 'day'];
  assert.deepEqual(Object.keys(rules.availableViews()), ['day']);
});

test('hiding every weekday falls back to visible days while invalid weekday names are ignored', (t) => {
  const warning = t.mock.method(console, 'warn', () => {});
  const { props, rules } = setup({
    hideWeekdays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  });
  assert.deepEqual(rules.hideWeekdays(), {});
  assert.equal(warning.mock.callCount(), 1);
  props.hideWeekdays = ['mon', 'bogus', 'toString'];
  assert.deepEqual(rules.hideWeekdays(), { 1: true });
});

test('hidden weekdays retain Monday=1/Sunday=7 and weekend derivation', () => {
  const { props, rules } = setup({ hideWeekdays: ['mon', 'sat', 'sun'] });
  assert.deepEqual(rules.hideWeekdays(), { 1: true, 6: true, 7: true });
  assert.equal(rules.hideWeekends(), true);
  props.hideWeekdays = ['tue'];
  assert.equal(rules.hideWeekends(), undefined);
  props.hideWeekends = true;
  assert.deepEqual(rules.hideWeekdays(), { 2: true, 6: true, 7: true });
});

test('date rules preserve Date identity and original valid disabled strings', () => {
  const selected = new Date(2026, 9, 20, 15);
  const { props, rules } = setup({
    selectedDate: selected,
    disableDays: [selected, '2026-10-21'],
    minDate: selected,
    maxDate: '2026-10-31',
  });
  assert.equal(rules.selectedDate(), selected);
  assert.equal(selected.getHours(), 15);
  assert.deepEqual(rules.disableDays(), ['2026-10-20', '2026-10-21']);
  assert.equal(rules.minTimestamp(), selected.getTime());
  assert.equal(rules.maxTimestamp(), new Date(2026, 9, 31).getTime());
  props.selectedDate = '2026-11-01';
  assert.equal(rules.selectedDate()?.getTime(), new Date(2026, 10, 1).getTime());
});

test('invalid dates warn only for nonempty selected/disabled values and bounds become null', (t) => {
  const warning = t.mock.method(console, 'warn', () => {});
  const { props, rules } = setup({
    selectedDate: '',
    disableDays: ['bad'],
    minDate: 'bad',
    maxDate: new Date(NaN),
  });
  assert.equal(rules.selectedDate(), undefined);
  assert.equal(warning.mock.callCount(), 0);
  assert.deepEqual(rules.disableDays(), []);
  assert.equal(warning.mock.callCount(), 1);
  assert.equal(rules.minTimestamp(), null);
  assert.equal(rules.maxTimestamp(), null);
  props.selectedDate = undefined;
  assert.equal(rules.selectedDate(), undefined);
});

test('schedule ids preserve zero, infer from original position and never mutate input', () => {
  const schedules = [
    { id: 0, label: 'zero' },
    { hide: true },
    { label: 'third', style: { color: 'red' } },
  ];
  const { rules, view } = setup({ schedules });
  const result = rules.schedules();
  assert.deepEqual(
    result?.map((s) => s.id),
    [0, 3],
  );
  assert.notEqual(result?.[0], schedules[0]);
  assert.equal('id' in schedules[2], false);
  view.isWeek = false;
  view.isMonth = true;
  assert.equal(rules.schedules(), undefined);
});

test('specialHours precedence, weekday filtering and disallowed derivation are shared', () => {
  const businessHours = { mon: { from: 540, to: 600, allowEvents: false } };
  const { props, rules } = setup({ specialHours: {}, businessHours });
  assert.equal(rules.rawSpecialHours(), businessHours);
  assert.equal(rules.specialHoursDisallowed().hasAny, true);
  props.specialHours = { tue: [{ from: 600, to: 720 }], invalid: { from: 1, to: 2 } };
  assert.deepEqual(Object.keys(rules.specialHours()), ['tue']);
  assert.equal(rules.specialHoursDisallowed().hasAny, false);
});

test('edit permissions preserve boolean defaults and sparse resizeX shape', () => {
  const { props, rules } = setup();
  assert.deepEqual(rules.editableEvents(), {
    drag: false,
    resize: false,
    delete: false,
    create: false,
  });
  assert.equal('resizeX' in rules.editableEvents(), false);
  props.editableEvents = { drag: false, resizeX: true };
  assert.deepEqual(rules.editableEvents(), {
    drag: false,
    resize: true,
    delete: true,
    create: true,
    resizeX: true,
  });
  props.editableEvents = true;
  assert.equal(rules.editableEvents().drag, true);
});

test('time/display rules follow active view and eventCount membership', () => {
  const { props, view, rules } = setup({
    eventCount: ['month'],
    allDayEvents: true,
    horizontal: true,
    timeAtCursor: true,
  });
  assert.equal(rules.allDayEvents(), true);
  assert.equal(rules.horizontal(), true);
  assert.equal(rules.timeAtCursor(), true);
  view.id = 'month';
  view.isWeek = false;
  view.isMonth = true;
  assert.equal(rules.showCellEventCount(), true);
  assert.equal(rules.allDayEvents(), false);
  assert.equal(rules.horizontal(), false);
  props.eventsOnMonthView = true;
  assert.equal(rules.showCellEventCount(), false);
  props.time = false;
  assert.equal(rules.timeAtCursor(), false);
});

test('external listeners retain function identity and camel/kebab normalization', () => {
  const handler = () => {};
  const { rules } = setup(
    {},
    {
      'onCellMouseenter': handler,
      'onEventDelayed-click': handler,
      'onEventResizeEnd': handler,
      'onCellIgnored': 1,
      'onClick': handler,
    },
  );
  assert.deepEqual(rules.eventListeners(), {
    cell: { mouseenter: handler },
    event: { 'delayed-click': handler, 'resize-end': handler },
  });
});

test('rule construction reads only dateUtils and individual rules keep lazy dependencies', () => {
  const props = setup().props;
  Object.defineProperty(props, 'views', {
    get() {
      throw new Error('eager views');
    },
  });
  const rules = createCalendarConfigRules(
    props,
    {
      dateUtils: createDateUtils(() => 'en'),
      view: {
        id: 'week',
        get isDay(): boolean {
          throw new Error('eager view flag');
        },
        isDays: false,
        isWeek: true,
        isMonth: false,
        isYear: false,
      },
    },
    {
      get availableViews(): Record<string, { cols: number; rows: number }> {
        throw new Error('eager layout');
      },
      hideWeekdays: {},
      rawSpecialHours: {},
      specialHours: {},
    },
    {},
  );
  assert.equal(rules.sm(), false);
  assert.equal(rules.allDayEvents(), false);
  assert.equal(rules.timeAtCursor(), false);
});

test('calendar texts use requested locale data, Monday order and English UI fallbacks', () => {
  const texts = createCalendarTexts({ today: 'Now', view: { week: 'Custom week' } }, 'en');
  assert.equal(texts.today, 'Now');
  assert.equal(texts.week, 'Custom week');
  assert.equal(texts.day, 'Day');
  assert.equal(texts.weekDays[0], dayjs.Ls.en.weekdays?.[1]);
  assert.equal(texts.months, dayjs.Ls.en.months);
  assert.deepEqual(createCalendarTexts(undefined, 'missing'), createCalendarTexts(undefined, 'en'));
});

test('locale requests capture locale/weekStart before await and only newest updates existing texts', async () => {
  const calls: [string, number][] = [];
  const resolvers: ((value: string) => void)[] = [];
  const texts: CalendarTexts = { ...defaults.texts, monthsGenitive: ['retained'] };
  let locale = 'zh-cn';
  let weekStart = 1;
  let today = 'Before';
  let translationsCalled = 0;
  const load = createCalendarTextsLoader({
    get locale() {
      return locale;
    },
    get weekStart() {
      return weekStart;
    },
    texts,
    initializeLocale(l, w) {
      calls.push([l, w]);
      return new Promise((resolve) => resolvers.push(resolve));
    },
    translations() {
      translationsCalled++;
      return { today };
    },
  });
  const first = load('');
  locale = 'en-us';
  weekStart = 0;
  const second = load('fr');
  today = 'After';
  resolvers[1]('fr');
  await second;
  resolvers[0]('zh-cn');
  await first;
  assert.deepEqual(calls, [
    ['zh-cn', 1],
    ['fr', 0],
  ]);
  assert.equal(translationsCalled, 1);
  assert.equal(texts.today, 'After');
  assert.equal(texts.dateLocale, 'fr');
  assert.deepEqual(texts.monthsGenitive, ['retained']);
  locale = '';
  const fallback = load('');
  assert.deepEqual(calls.at(-1), ['en-us', 0]);
  resolvers[2]('en');
  await fallback;
});

test('locale rejection propagates and leaves calendar texts untouched', async () => {
  const texts = { ...defaults.texts };
  const before = { ...texts };
  const load = createCalendarTextsLoader({
    locale: 'en',
    weekStart: 1,
    texts,
    initializeLocale: async () => {
      throw new Error('loader failed');
    },
    translations: () => ({ today: 'changed' }),
  });
  await assert.rejects(load('en'), /loader failed/);
  assert.deepEqual(texts, before);
});

test('calendar locale texts preserve meridiem and abbreviated weekday fallback', () => {
  dayjs.Ls['calendar-test'] = {
    ...dayjs.Ls.en,
    name: 'calendar-test',
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    meridiem: (hour: number) => (hour < 12 ? 'morning' : 'evening'),
  } as typeof dayjs.Ls.en;
  try {
    const texts = createCalendarTexts(undefined, 'calendar-test');
    assert.deepEqual(texts.weekDaysMin, ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
    assert.equal(texts.am, 'morning');
    assert.equal(texts.pm, 'evening');
  } finally {
    delete dayjs.Ls['calendar-test'];
  }
});

test('locale completion reads the current text target after translations', async () => {
  const original = { ...defaults.texts };
  let current = original;
  const load = createCalendarTextsLoader({
    locale: 'en',
    weekStart: 1,
    get texts() {
      return current;
    },
    initializeLocale: async () => 'en',
    translations() {
      current = { ...defaults.texts };
      return { today: 'replacement' };
    },
  });
  await load('en');
  assert.notEqual(current, original);
  assert.equal(current.today, 'replacement');
  assert.equal(original.today, defaults.texts.today);
});
