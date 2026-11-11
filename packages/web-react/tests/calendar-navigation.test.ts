import { defaults } from '@sdata/web-core/calendar/constants';
import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CalendarOptions } from '../src/calendar/types.ts';

import { resolveCalendarConfig } from '../dist/calendar/config.js';
import { createCalendarViewController } from '../dist/calendar/view-controller.js';

function setup(options: CalendarOptions = {}) {
  const emitted: { name: string; value: unknown }[] = [];
  const dateUtils = createDateUtils();
  let controller: ReturnType<typeof createCalendarViewController> | undefined;
  const view = {
    get id() {
      return controller?.state.id ?? options.view ?? 'week';
    },
    get isDay() {
      return this.id === 'day';
    },
    get isDays() {
      return this.id === 'days';
    },
    get isWeek() {
      return this.id === 'week';
    },
    get isMonth() {
      return this.id === 'month';
    },
    get isYear() {
      return this.id === 'year';
    },
  };
  const config = {
    ...Object.getOwnPropertyDescriptors(
      resolveCalendarConfig({ viewDate: '2026-11-08', ...options }, { dateUtils, view }),
    ),
  };
  const actual = Object.defineProperties({ ready: false }, config) as ReturnType<
    typeof resolveCalendarConfig
  > & { ready: boolean };
  let changes = 0;
  controller = createCalendarViewController({
    config: actual,
    texts: defaults.texts,
    dateUtils,
    emit: (name, value) => {
      emitted.push({ name, value });
    },
    nextRender: () => Promise.resolve(),
    onChange: () => {
      changes++;
    },
    getViewEvents: () => [],
  });
  actual.ready = true;
  return {
    controller,
    emitted,
    get changes() {
      return changes;
    },
  };
}
const day = (value: Date) => createDateUtils().formatDateLite(value);

test('Calendar navigation initializes normalized week boundaries without ready events', () => {
  const { controller, emitted } = setup();
  assert.equal(day(controller.layout.start), '2026-11-02');
  assert.equal(day(controller.layout.end), '2026-11-08');
  assert.deepEqual(emitted, []);
});

test('Calendar navigation keeps in-range targets for a later narrower view', async () => {
  const { controller, emitted } = setup({ view: 'month' });
  const dates = controller.layout.cellDates;
  controller.navigation.updateViewDate(new Date(2026, 10, 19));
  assert.equal(controller.layout.cellDates, dates);
  controller.navigation.switchView('day');
  await Promise.resolve();
  assert.equal(day(controller.layout.start), '2026-11-19');
  assert.deepEqual(
    emitted.map(({ name }) => name),
    ['update:viewDate', 'update:view', 'view-change'],
  );
});

test('Calendar navigation progresses across hidden-weekend Sunday-first weeks', async () => {
  const { controller, emitted } = setup({ startWeekOnSunday: true, hideWeekends: true });
  controller.navigation.next();
  await Promise.resolve();
  assert.equal(day(controller.layout.firstCellDate), '2026-11-09');
  controller.navigation.previous();
  await Promise.resolve();
  assert.equal(day(controller.layout.firstCellDate), '2026-11-02');
  assert.equal(emitted.filter(({ name }) => name === 'view-change').length, 2);
});

test('Calendar selection does not rebuild dates and avoids duplicate same-day events', () => {
  const { controller, emitted } = setup({ view: 'month' });
  const dates = controller.layout.cellDates;
  controller.navigation.updateSelectedDate(new Date(2026, 10, 12, 9));
  controller.navigation.updateSelectedDate(new Date(2026, 10, 12, 14));
  assert.equal(controller.layout.cellDates, dates);
  assert.equal(controller.state.selectedDate?.getHours(), 0);
  assert.deepEqual(
    emitted.map(({ name }) => name),
    ['update:selectedDate'],
  );
});
