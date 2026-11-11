import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveCalendarConfig } from '../dist/calendar/config.js';

function host(id = 'week') {
  return {
    dateUtils: createDateUtils(),
    view: {
      id,
      isDay: id === 'day',
      isDays: id === 'days',
      isWeek: id === 'week',
      isMonth: id === 'month',
      isYear: id === 'year',
    },
  };
}

test('Calendar config preserves Vue defaults and treats explicit undefined as omitted', () => {
  const config = resolveCalendarConfig({ time: undefined, timeStep: undefined }, host());
  assert.equal(config.view, 'week');
  assert.equal(config.time, true);
  assert.equal(config.timeStep, 60);
  assert.equal(config.timeTo, 1440);
  assert.equal(config.eventCreateMinDrag, 15);
  assert.equal(config.multidayEvents, true);
  assert.equal(config.theme, 'default');
  assert.deepEqual(config.editableEvents, {
    drag: false,
    resize: false,
    delete: false,
    create: false,
  });
  assert.deepEqual(Object.keys(config.availableViews), [
    'day',
    'days',
    'week',
    'month',
    'year',
    'years',
  ]);
  assert.equal(config.size, 'lg');
});

test('Calendar picker shorthand respects explicit navigation and visibility settings', () => {
  const config = resolveCalendarConfig(
    { datePicker: true, clickToNavigate: false, sm: true, time: false, timeAtCursor: true },
    host('month'),
  );
  assert.equal(config.view, 'month');
  assert.equal(config.xs, true);
  assert.equal(config.size, 'xs');
  assert.equal(config.clickToNavigate, false);
  assert.equal(config.timeAtCursor, false);
  assert.deepEqual(Object.keys(config.availableViews), ['month', 'year', 'years']);
});

test('Calendar config derives per-instance hidden days and follows live view state', () => {
  const state = host();
  const config = resolveCalendarConfig(
    {
      hideWeekdays: ['mon'],
      hideWeekends: true,
      horizontal: true,
      allDayEvents: true,
      eventCount: ['month'],
    },
    state,
  );
  assert.equal(config.hasHiddenDays, 3);
  assert.equal(config.horizontal, true);
  assert.equal(config.allDayEvents, true);
  assert.equal(config.showCellEventCount, false);
  Object.assign(state.view, host('month').view);
  assert.equal(config.horizontal, false);
  assert.equal(config.allDayEvents, false);
  assert.equal(config.showCellEventCount, true);
  assert.equal(resolveCalendarConfig({}, host()).hasHiddenDays, 0);
});

test('Calendar config retains schedule presentation, normalizes dates and forwards listener identity', () => {
  const click = () => {};
  const date = new Date(2026, 10, 8);
  const config = resolveCalendarConfig(
    {
      selectedDate: date,
      schedules: [
        { id: 0, label: 'First', style: { color: 'red' } },
        { id: 1, hide: true },
      ],
      editableEvents: { create: false },
    },
    host('day'),
    { onCellClick: click, onEventMouseenter: click },
  );
  assert.equal(config.selectedDate, date);
  assert.deepEqual(config.schedules, [{ id: 0, label: 'First', style: { color: 'red' } }]);
  assert.equal(config.eventListeners.cell.click, click);
  assert.equal(config.eventListeners.event.mouseenter, click);
  assert.equal(config.editableEvents.create, false);
  assert.equal(config.editableEvents.drag, true);
});

test('Calendar config does not mutate options or share default event collections', () => {
  const options = { views: ['day'], view: 'day', timeFrom: 0, snapToInterval: 0 };
  const config = resolveCalendarConfig(options, host('day'));
  assert.equal(config.view, 'day');
  assert.equal(config.timeFrom, 0);
  assert.equal(config.snapToInterval, 0);
  assert.deepEqual(options, { views: ['day'], view: 'day', timeFrom: 0, snapToInterval: 0 });
  assert.notEqual(config.events, resolveCalendarConfig({}, host()).events);
});
