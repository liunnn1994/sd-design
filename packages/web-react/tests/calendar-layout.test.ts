import { defaults } from '@sdata/web-core/calendar/constants';
import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CalendarOptions } from '../src/calendar/types.ts';

import { resolveCalendarConfig } from '../dist/calendar/config.js';
import { resolveCalendarLayout } from '../dist/calendar/view-layout.js';

const dateUtils = createDateUtils(() => 'en');
function layout(viewId: string, start: Date, options: CalendarOptions = {}, now = start) {
  const view = {
    id: viewId,
    isDay: viewId === 'day',
    isDays: viewId === 'days',
    isWeek: viewId === 'week',
    isMonth: viewId === 'month',
    isYear: viewId === 'year',
  };
  return resolveCalendarLayout({
    viewId,
    startTheoretical: start,
    now,
    dateUtils,
    texts: defaults.texts,
    config: resolveCalendarConfig(options, { dateUtils, view }),
  });
}
const day = (value: Date) => dateUtils.formatDateLite(value);

test('Calendar layout distinguishes leap-month bounds from its visible grid', () => {
  const view = layout('month', new Date(2024, 1, 1));
  assert.equal(view.cellsCount, 42);
  assert.equal(day(view.start), '2024-02-01');
  assert.equal(day(view.end), '2024-02-29');
  assert.equal(day(view.firstCellDate), '2024-01-29');
  assert.equal(day(view.lastCellDate), '2024-03-10');
  assert.equal(view.title, 'February 2024');
  assert.equal(view.narrowerView, 'week');
  assert.equal(view.broaderView, 'year');
});

test('Calendar horizontal hidden-weekend layout keeps the complete week range', () => {
  const view = layout(
    'week',
    new Date(2026, 10, 2),
    { horizontal: true, hideWeekends: true },
    new Date(2026, 10, 8, 12),
  );
  assert.equal(view.cols, 1);
  assert.equal(view.rows, 5);
  assert.equal(day(view.firstCellDate), '2026-11-02');
  assert.equal(day(view.lastCellDate), '2026-11-06');
  assert.equal(day(view.extendedEnd), '2026-11-08');
  assert.equal(view.containsToday, true);
  assert.ok(view.cellDates.every(({ start }) => start.getDay() !== 0 && start.getDay() !== 6));
});

test('Calendar day layout uses time limits to determine now-line visibility', () => {
  const start = new Date(2026, 10, 8);
  assert.equal(
    layout('day', start, { timeFrom: 540, timeTo: 1020 }, new Date(2026, 10, 8, 8)).nowLineVisible,
    undefined,
  );
  assert.equal(
    layout('day', start, { timeFrom: 540, timeTo: 1020 }, new Date(2026, 10, 8, 12)).nowLineVisible,
    true,
  );
  assert.equal(
    layout('day', start, { time: false }, new Date(2026, 10, 8, 12)).nowLineVisible,
    undefined,
  );
});

test('Calendar year and years views preserve month and year cell intervals', () => {
  const year = layout('year', new Date(2024, 0, 1));
  assert.equal(year.cellDates.length, 12);
  assert.equal(day(year.cellDates[1].end), '2024-02-29');
  assert.equal(day(year.end), '2024-12-31');
  const years = layout('years', new Date(2025, 0, 1));
  assert.equal(years.cellDates.length, 25);
  assert.equal(years.title, '2025 - 2049');
  assert.equal(years.broaderView, undefined);
});
