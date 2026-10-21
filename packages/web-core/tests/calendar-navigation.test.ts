import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CalendarViewMathHost } from '../dist/calendar/view-math.js';

import { createCalendarClock, createCalendarScroll } from '../dist/calendar/clock.js';
import { defaults } from '../dist/calendar/constants.js';
import { createCalendarNavigation } from '../dist/calendar/navigation.js';
import { createDateUtils } from '../dist/calendar/utils/date.js';
import {
  calendarContainsToday,
  calendarNowLineVisible,
  getAdjacentCalendarView,
  getCalendarCellDates,
  getCalendarColumns,
  getCalendarRangeStart,
  getCalendarRangeEnd,
  getCalendarExtendedStart,
  getCalendarExtendedEnd,
  getCalendarFirstCellDate,
  getCalendarRows,
  getCalendarTitle,
  getCalendarWeekTitle,
  getCalendarInitialView,
  getCalendarInitialViewDate,
} from '../dist/calendar/view-math.js';

const date = (value: string) => new Date(`${value}T00:00:00`);
const dateUtils = createDateUtils(() => 'en');

test('Calendar initial view keeps explicit availability and lazy fallback against the captured map', () => {
  assert.equal(
    getCalendarInitialView(
      {
        view: 'week',
        get defaultView(): string {
          throw new Error('eager fallback');
        },
      },
      { week: {} },
    ),
    'week',
  );
  assert.equal(
    getCalendarInitialView({ view: 'unknown', defaultView: 'month' }, { month: {} }),
    'month',
  );
  assert.equal(getCalendarInitialView({ view: '', defaultView: 'day' }, { day: {} }), 'day');
});

test('Calendar initial date copies explicit dates, clears time and reads the fallback clock lazily', () => {
  const input = new Date(2026, 9, 20, 12, 45, 30, 100);
  const result = getCalendarInitialViewDate(input, () => {
    throw new Error('eager clock');
  });
  assert.notEqual(result, input);
  assert.equal(result.getHours(), 0);
  assert.equal(result.getMinutes(), 0);
  assert.equal(result.getDate(), 20);
  assert.equal(input.getHours(), 12);
  assert.equal(input.getMilliseconds(), 100);
  const now = new Date(2026, 9, 21, 19, 30);
  const fallback = getCalendarInitialViewDate('', () => now);
  assert.notEqual(fallback, now);
  assert.equal(fallback.getDate(), 21);
  assert.equal(fallback.getHours(), 0);
  assert.equal(now.getHours(), 19);
});

test('Calendar initial date preserves native string, invalid-date and epoch semantics', () => {
  const fallback = () => new Date(2030, 0, 1);
  assert.equal(
    getCalendarInitialViewDate('2026-10-20T12:45:00', fallback).getTime(),
    new Date(2026, 9, 20).getTime(),
  );
  assert.ok(Number.isNaN(getCalendarInitialViewDate('invalid', fallback).getTime()));
  const epoch = new Date(0),
    result = getCalendarInitialViewDate(epoch, fallback);
  assert.equal(result.getFullYear(), 1970);
  assert.equal(result.getHours(), 0);
  assert.equal(epoch.getTime(), 0);
});
const config = () => ({
  availableViews: { ...defaults.availableViews },
  hasHiddenDays: 0,
  horizontal: false,
  startWeekOnSunday: false,
  hideWeekdays: {} as Record<number, boolean>,
  viewDayOffset: 0,
  locale: 'en',
  xs: false,
  time: true,
  timeFrom: 540,
  timeTo: 840,
  ready: false,
});

function mathHost() {
  return {
    config: config(),
    dateUtils,
    texts: {
      ...defaults.texts,
      dateFormat: 'MMMM D, YYYY',
      week: 'Week',
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    },
    startTheoretical: date('2026-10-19'),
    viewId: 'week',
    now: date('2026-10-21'),
    extendedStart: date('2026-10-19'),
    extendedEnd: date('2026-10-25'),
    firstCellDate: date('2026-10-19'),
    lastCellDate: date('2026-10-25'),
    start: date('2026-10-19'),
    end: date('2026-10-25'),
    containsToday: true,
  } satisfies CalendarViewMathHost;
}

function fixture() {
  const settings = config();
  const notifications: unknown[][] = [];
  const state = {
    config: settings,
    dateUtils,
    viewId: 'week',
    viewDate: date('2026-10-21'),
    now: date('2026-10-21'),
    startTheoretical: date('2026-10-21'),
    selectedDate: null as Date | null,
    transitionDirection: 'right',
    get cellsCount() {
      return getCalendarColumns(this.viewId, settings) * getCalendarRows(this.viewId, settings);
    },
    get firstCellDate() {
      return getCalendarFirstCellDate(this.viewId, this.startTheoretical, settings, dateUtils);
    },
    get lastCellDate() {
      return getCalendarCellDates(
        this.viewId,
        this.firstCellDate,
        this.cellsCount,
        settings,
        dateUtils,
      ).at(-1)!.end;
    },
    get start() {
      return this.viewId === 'month' ? this.startTheoretical : this.firstCellDate;
    },
    get end() {
      return this.viewId === 'month'
        ? new Date(
            this.startTheoretical.getFullYear(),
            this.startTheoretical.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          )
        : this.lastCellDate;
    },
    get extendedStart() {
      return this.viewId === 'week'
        ? dateUtils.getPreviousFirstDayOfWeek(this.firstCellDate, settings.startWeekOnSunday)
        : this.firstCellDate;
    },
    get broaderView() {
      return getAdjacentCalendarView(this.viewId, settings.availableViews, 1);
    },
    get narrowerView() {
      return getAdjacentCalendarView(this.viewId, settings.availableViews, -1);
    },
    emit: (...args: unknown[]) => {
      notifications.push([...args, state.viewId]);
    },
    nextRender: async () => {},
    snapshot: () => ({ id: state.viewId, start: state.start }),
  };
  const navigation = createCalendarNavigation(state);
  void navigation.updateView();
  return { settings, state, navigation, notifications };
}

test('Calendar horizontal hidden days affect rows and vertical hidden days affect columns', () => {
  const settings = config();
  settings.hasHiddenDays = 2;
  settings.hideWeekdays = { 6: true, 7: true };
  assert.equal(getCalendarColumns('week', settings), 5);
  assert.equal(getCalendarRows('week', settings), 1);
  settings.horizontal = true;
  settings.availableViews.week = { cols: 1, rows: 7 };
  assert.equal(getCalendarColumns('week', settings), 1);
  assert.equal(getCalendarRows('week', settings), 5);
  assert.equal(getCalendarColumns('unavailable', settings), 1);
});

test('Calendar range endpoints keep theoretical months distinct from padded cells', () => {
  const host = mathHost();
  host.viewId = 'month';
  host.startTheoretical = date('2024-02-01');
  host.firstCellDate = date('2024-01-29');
  host.lastCellDate = new Date('2024-03-10T23:59:59.999');
  assert.equal(getCalendarRangeStart(host), host.startTheoretical);
  const end = getCalendarRangeEnd(host);
  assert.equal(end.getDate(), 29);
  assert.equal(end.getMonth(), 1);
  assert.equal(end.getMilliseconds(), 999);
  assert.equal(getCalendarExtendedStart(host), host.firstCellDate);
  assert.equal(getCalendarExtendedEnd(host), host.lastCellDate);
  host.viewId = 'week';
  host.extendedStart = date('2024-02-05');
  assert.equal(getCalendarExtendedEnd(host).getDate(), 11);
  assert.equal(getCalendarExtendedEnd(host).getHours(), 23);
});

test('Calendar cell dates fill skipped weekdays and preserve day boundaries', () => {
  const settings = config();
  settings.hasHiddenDays = 2;
  settings.hideWeekdays = { 6: true, 7: true };
  const cells = getCalendarCellDates('days', date('2026-10-23'), 3, settings, dateUtils);
  assert.deepEqual(
    cells.map((cell) => dateUtils.formatDate(cell.start)),
    ['2026-10-23', '2026-10-26', '2026-10-27'],
  );
  assert.equal(cells[0].end.getMilliseconds(), 999);
  assert.equal(cells[0].end.getHours(), 23);
  const months = getCalendarCellDates('year', date('2024-01-01'), 12, settings, dateUtils);
  assert.equal(months[1].end.getDate(), 29);
  assert.equal(
    getCalendarCellDates('years', date('2025-01-01'), 25, settings, dateUtils)
      .at(-1)!
      .end.getFullYear(),
    2049,
  );
});

test('Calendar month padding and week offsets respect the existing Sunday-first rules', () => {
  const settings = config();
  assert.equal(
    dateUtils.formatDate(
      getCalendarFirstCellDate('month', date('2026-10-01'), settings, dateUtils),
    ),
    '2026-09-28',
  );
  settings.startWeekOnSunday = true;
  assert.equal(
    dateUtils.formatDate(
      getCalendarFirstCellDate('month', date('2026-10-01'), settings, dateUtils),
    ),
    '2026-09-27',
  );
  settings.hideWeekdays = { 7: true };
  settings.hasHiddenDays = 1;
  assert.equal(
    dateUtils.formatDate(getCalendarFirstCellDate('week', date('2026-10-19'), settings, dateUtils)),
    '2026-10-19',
  );
});

test('Calendar titles preserve month order, truncation, cross-year text and numeric years', () => {
  const host = mathHost();
  assert.equal(getCalendarTitle(host), 'October 19-25, 2026');
  host.firstCellDate = date('2026-12-28');
  host.lastCellDate = date('2027-01-03');
  assert.equal(getCalendarTitle(host), 'Dec 28, 2026 - Jan 3, 2027');
  host.texts.dateFormat = 'D MMMM YYYY';
  host.texts.truncations = false;
  assert.equal(getCalendarTitle(host), '28 December 2026 - 3 January 2027');
  host.viewId = 'year';
  assert.equal(getCalendarTitle(host), 2026);
});

test('Calendar title and week label preserve lazy reads for unrelated date computations', () => {
  const host = mathHost();
  host.viewId = 'year';
  Object.defineProperty(host, 'end', {
    get() {
      throw new Error('year title must not read range end');
    },
  });
  assert.equal(getCalendarTitle(host), 2026);
  assert.equal(getCalendarWeekTitle(host), null);
  host.viewId = 'month';
  Object.defineProperty(host, 'containsToday', {
    get() {
      throw new Error('month has no now line');
    },
  });
  assert.equal(calendarNowLineVisible(host), undefined);
});

test('Calendar current-week containment reads extended bounds without unrelated cell bounds', () => {
  const host = mathHost();
  Object.defineProperty(host, 'firstCellDate', {
    get() {
      throw new Error('week containment uses extended bounds');
    },
  });
  Object.defineProperty(host, 'lastCellDate', {
    get() {
      throw new Error('week containment uses extended bounds');
    },
  });
  assert.equal(calendarContainsToday(host), true);
});

test('Calendar now line keeps undefined outside time range and true at inclusive endpoints', () => {
  const host = mathHost();
  host.now = new Date('2026-10-21T09:00:00');
  assert.equal(calendarNowLineVisible(host), true);
  host.now = new Date('2026-10-21T14:00:00');
  assert.equal(calendarNowLineVisible(host), true);
  host.now = new Date('2026-10-21T14:01:00');
  assert.equal(calendarNowLineVisible(host), undefined);
});

test('Calendar navigation emits view changes before assigning the new view and uses same-range anchors', () => {
  const { state, navigation, notifications } = fixture();
  const anchor = date('2026-10-22');
  navigation.updateViewDate(anchor);
  assert.equal(state.viewDate, anchor);
  assert.equal(dateUtils.formatDate(state.startTheoretical), '2026-10-19');
  navigation.switchView('month');
  assert.deepEqual(notifications.at(-1), ['update:view', 'month', 'week']);
  assert.equal(state.viewId, 'month');
  assert.equal(dateUtils.formatDate(state.startTheoretical), '2026-10-01');
});

test('Calendar view-change snapshots read current state after the host render completes', async () => {
  const { state, settings, navigation, notifications } = fixture();
  let complete!: () => void;
  settings.ready = true;
  state.nextRender = () =>
    new Promise<void>((resolve) => {
      complete = resolve;
    });
  const pending = navigation.updateView();
  assert.equal(notifications.length, 0);
  state.viewId = 'year';
  complete();
  await pending;
  assert.equal(notifications[0][0], 'view-change');
  assert.equal((notifications[0][1] as { id: string }).id, 'year');
});

test('Calendar week navigation advances seven days even with Sunday hidden', () => {
  const { state, settings, navigation } = fixture();
  settings.startWeekOnSunday = true;
  settings.hideWeekdays = { 6: true, 7: true };
  settings.hasHiddenDays = 2;
  void navigation.updateView();
  const original = state.firstCellDate.getTime();
  navigation.next();
  assert.equal(state.firstCellDate.getTime() - original, 7 * 86400000);
});

test('Calendar year and years navigation preserve February anchors and grid-aligned starts', () => {
  const { state, navigation } = fixture();
  navigation.switchView('year');
  navigation.next();
  assert.equal(state.viewDate.getFullYear(), 2027);
  assert.equal(state.viewDate.getMonth(), 1);
  assert.equal(state.startTheoretical.getMonth(), 0);
  navigation.switchView('years');
  assert.equal(state.startTheoretical.getFullYear(), 2025);
  navigation.next();
  assert.equal(state.startTheoretical.getFullYear(), 2050);
});

test('Calendar selection mutates supplied dates to midnight and deduplicates same-day notifications', () => {
  const { state, navigation, notifications } = fixture();
  const selected = new Date('2026-10-21T15:45:00');
  navigation.updateSelectedDate(selected);
  navigation.updateSelectedDate(new Date('2026-10-21T20:00:00'));
  assert.equal(state.selectedDate, selected);
  assert.equal(selected.getHours(), 0);
  assert.equal(notifications.filter((args) => args[0] === 'update:selectedDate').length, 1);
});

test('Calendar invalid navigation retains the current view and date', (context) => {
  const { state, navigation } = fixture();
  const warn = context.mock.method(console, 'warn', () => {});
  const original = state.viewDate;
  navigation.switchView('not-a-view');
  navigation.updateViewDate('invalid');
  assert.equal(state.viewId, 'week');
  assert.equal(state.viewDate, original);
  assert.equal(warn.mock.callCount(), 2);
});

test('Calendar scroll driver keeps clipping, cell-height scaling and root-scroll reset', () => {
  const values: number[] = [];
  const driver = createCalendarScroll({
    config: { timeFrom: 540, timeCellHeight: 40, timeStep: 30 },
    scrollTop: (value) => values.push(value),
  });
  driver.scrollToTime(600);
  driver.scrollToTime(400);
  driver.scrollTop();
  assert.deepEqual(values, [80, 0, 0]);
});

test('Calendar clock stays inactive without a browser', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let updates = 0;
  const current = date('2026-10-21');
  const clock = createCalendarClock({
    get now() {
      return current;
    },
    set now(_value) {
      updates++;
    },
  });
  clock.start();
  context.mock.timers.tick(180000);
  assert.equal(updates, 0);
  clock.stop();
});

test('Calendar browser clock aligns once to a minute, repeats, and stops cleanly', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  let current = new Date(),
    updates = 0;
  const clock = createCalendarClock({
    get now() {
      return current;
    },
    set now(value) {
      current = value;
      updates++;
    },
  });
  try {
    clock.start();
    const delay = 60000 - (current.getSeconds() * 1000 + current.getMilliseconds());
    context.mock.timers.tick(delay - 1);
    assert.equal(updates, 1);
    context.mock.timers.tick(1);
    assert.equal(updates, 2);
    context.mock.timers.tick(60000);
    assert.equal(updates, 3);
    clock.stop();
    context.mock.timers.tick(60000);
    assert.equal(updates, 3);
  } finally {
    clock.stop();
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
