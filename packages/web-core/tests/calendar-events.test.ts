import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CalendarEventsHost } from '../dist/calendar/events-host.js';
import type { CalendarEvent, CalendarEventInput } from '../dist/calendar/types.js';

import { createCalendarEvents } from '../dist/calendar/events.js';
import {
  eventRangeViolatesAllowEvents,
  clampResizeProposedRange,
} from '../dist/calendar/special-hours-allow-events.js';
import {
  buildSpecialHoursDisallowed,
  normalizeSpecialHoursDay,
} from '../dist/calendar/special-hours.js';
import { createDateUtils } from '../dist/calendar/utils/date.js';

const date = (time: string, day = '2026-10-19') => new Date(`${day}T${time}:00`);
function fixture(
  inputs: CalendarEventInput[] = [],
  options: Partial<CalendarEventsHost['config']> = {},
) {
  let rebuild = () => {};
  const cleanup: (() => void)[] = [];
  const emitted: unknown[][] = [];
  const host: CalendarEventsHost = {
    config: {
      events: inputs as CalendarEvent[],
      time: true,
      timeFrom: 0,
      timeTo: 1440,
      horizontal: false,
      multidayEvents: true,
      allDayEvents: false,
      editableEvents: { delete: true },
      snapToInterval: 0,
      ...options,
    },
    dateUtils: createDateUtils(),
    prefixCls: 'sd-calendar',
    emit: (...args) => {
      emitted.push(args);
    },
    touch: { isResizingEvent: false, currentHoveredCell: null },
  };
  const manager = createCalendarEvents(host, {
    createState: (state) => state,
    createIndex: (state) => state,
    observeEvents: (callback) => {
      rebuild = callback;
      callback();
    },
    onDispose: (callback) => {
      cleanup.push(callback);
    },
  });
  return { host, manager, emitted, rebuild: () => rebuild(), cleanup };
}

test('Calendar indexes normalized events without replacing caller objects or methods', () => {
  const input: CalendarEventInput = {
    title: 'A',
    start: '2026-10-19 09:00:45',
    end: '2026-10-19 10:00:59',
  };
  const state = fixture([input]);
  const event = state.host.config.events[0];
  assert.equal(event, input);
  assert.equal(event.start.getSeconds(), 0);
  assert.equal(event.end.getHours(), 10);
  assert.equal(event.end.getMinutes(), 1);
  assert.equal(event._.duration, 61);
  assert.equal(event._.startFormatted, '2026-10-19');
  assert.equal(state.manager.getEvent(event._.id), event);
  const remove = event.delete;
  const register = event._.register;
  state.rebuild();
  assert.equal(event.delete, remove);
  assert.equal(event._.register, register);
  assert.deepEqual(state.manager.eventsIndex.byDate['2026-10-19'], [event._.id]);
});

test('disposed Calendar event managers ignore delayed event creation', (t) => {
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: new EventTarget() });
  t.after(() => {
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  });
  const state = fixture();
  state.cleanup.forEach((cleanup) => cleanup());
  const result = state.manager.createEvent({ start: date('09:00'), end: date('10:00') });
  assert.equal(result, undefined);
  assert.deepEqual(state.host.config.events, []);
  assert.deepEqual(state.emitted, []);
});

test('Calendar reindexes replacements of the same length and retains old event identity only while present', () => {
  const state = fixture([{ start: date('09:00'), end: date('10:00') }]);
  const old = state.host.config.events[0];
  state.host.config.events.splice(0, 1, {
    start: date('11:00'),
    end: date('12:00'),
  } as CalendarEvent);
  state.rebuild();
  assert.equal(state.manager.getEvent(old._.id), undefined);
  const current = state.host.config.events[0];
  assert.equal(state.manager.getEvent(current._.id), current);
  assert.notEqual(current._.id, old._.id);
});

test('Calendar preserves registration notifications and methods after DOM unregistration', () => {
  const state = fixture();
  const event = state.manager.createEvent({ start: date('09:00'), end: date('10:00') })!;
  state.rebuild();
  const element = {} as HTMLElement;
  event._.register!(element);
  event._.register!(element);
  assert.equal(state.emitted.length, 1);
  assert.equal(state.emitted[0][0], 'event-created');
  assert.equal(state.emitted[0][1], event);
  event._.unregister!();
  assert.equal(event._.$el, null);
  assert.equal(typeof event.delete, 'function');
  assert.equal(typeof event._.register, 'function');
});

test('Calendar creation snaps copied dates and overrides an incoming id', () => {
  const state = fixture([], { snapToInterval: 15 });
  const start = date('09:07');
  const end = date('10:08');
  const input = { start, end, _: { id: 999 } } as CalendarEventInput;
  const event = state.manager.createEvent(input)!;
  state.rebuild();
  assert.notEqual(event, input);
  assert.notEqual(event._.id, 999);
  assert.equal(start.getMinutes(), 7);
  assert.equal(end.getMinutes(), 8);
  assert.equal(event.start.getMinutes(), 0);
  assert.equal(event.end.getMinutes(), 15);
});

test('Calendar overlap queries distinguish schedule ids, adjacency and excluded ids', () => {
  const state = fixture(
    [
      { start: date('09:00'), end: date('10:00'), schedule: 0 },
      { start: date('09:30'), end: date('10:30'), schedule: 0 },
      { start: date('09:30'), end: date('10:30'), schedule: '0' },
      { start: date('10:00'), end: date('11:00'), schedule: 0 },
    ],
    { schedules: [{ id: 0 }, { id: '0' }] },
  );
  const [first, second, third, fourth] = state.host.config.events;
  assert.deepEqual(first.getOverlappingEvents(), [second]);
  assert.equal(first.isOverlapping(), 1);
  assert.equal(first.getOverlappingEvents().includes(fourth), false);
  assert.deepEqual(
    state.manager.getEventsInRange(date('09:00'), date('10:00'), {
      schedule: '0',
      exactTime: true,
    }),
    [third],
  );
  assert.deepEqual(
    state.manager.getEventsInRange(date('09:00'), date('10:00'), {
      excludeIds: [first._.id, third._.id],
      exactTime: true,
    }),
    [second],
  );
});

test('Calendar overlap positions use maximum concurrency rather than total streak length', () => {
  const state = fixture([
    { start: date('09:00'), end: date('12:00') },
    { start: date('09:30'), end: date('10:00') },
    { start: date('10:30'), end: date('11:00') },
  ]);
  const result = state.manager.getCellOverlappingEvents(date('00:00'), date('23:59'), false);
  assert.equal(result.longestStreak, 2);
  for (const event of state.host.config.events)
    assert.equal(result.cellOverlaps[event._.id].maxConcurrent, 2);
});

test('Calendar all-day ranges exclude an ending midnight and honor all-day filters', () => {
  const state = fixture(
    [
      { start: date('00:00'), end: date('00:00', '2026-10-20'), allDay: true },
      { start: date('09:00'), end: date('10:00') },
    ],
    { allDayEvents: true },
  );
  const allDay = state.host.config.events[0];
  assert.deepEqual(state.manager.getEventsInRange(date('00:00'), date('23:59'), { allDay: true }), [
    allDay,
  ]);
  assert.deepEqual(
    state.manager.getEventsInRange(date('00:00', '2026-10-20'), date('23:59', '2026-10-20'), {
      allDay: true,
    }),
    [],
  );
});

test('Calendar indexed queries above 100 events retain multiday events and range boundaries', () => {
  const inputs: CalendarEventInput[] = Array.from({ length: 101 }, (_, index) => ({
    start: date('09:00'),
    end: date('10:00'),
    title: String(index),
  }));
  inputs.push({ start: date('23:00', '2026-10-18'), end: date('11:00'), title: 'multiday' });
  const state = fixture(inputs);
  const events = state.manager.getEventsInRange(date('09:30'), date('09:45'), { exactTime: true });
  assert.equal(events.length, 102);
  assert.ok(events.some((event) => event.title === 'multiday'));
});

test('Calendar staged deletion keeps preview state then emits updates before deletion', async () => {
  const state = fixture([{ start: date('09:00'), end: date('10:00') }]);
  const event = state.host.config.events[0];
  assert.equal(await event.delete(1), true);
  assert.equal(event._.deleting, true);
  assert.equal(state.host.config.events.length, 1);
  assert.equal(await event.delete(3), true);
  state.rebuild();
  assert.equal(state.host.config.events.length, 0);
  assert.deepEqual(
    state.emitted.map((args) => args[0]),
    ['update:events', 'event-delete'],
  );
  assert.equal(state.emitted[1][1], event);
});

test('Calendar special hours normalize copies and retain empty schedule overrides', () => {
  const range = { from: 600, to: 660, allowEvents: false };
  const day = normalizeSpecialHoursDay({
    default: [range],
    schedules: { open: [], blocked: [range] },
  })!;
  assert.notEqual(day.default[0], range);
  const disallowed = buildSpecialHoursDisallowed({ mon: day });
  assert.equal(disallowed.hasAny, true);
  assert.deepEqual(disallowed.byWeekday.mon.schedules?.open, []);
  assert.equal(
    eventRangeViolatesAllowEvents({
      start: date('10:00'),
      end: date('11:00'),
      schedule: 'open',
      disallowed,
      hasSchedules: true,
    }),
    false,
  );
  assert.equal(
    eventRangeViolatesAllowEvents({
      start: date('10:00'),
      end: date('11:00'),
      schedule: 'other',
      disallowed,
      hasSchedules: true,
    }),
    true,
  );
});

test('Calendar disallowed creation is rejected while all-day creation remains valid', () => {
  const state = fixture([], {
    specialHoursDisallowed: {
      hasAny: true,
      byWeekday: { mon: { default: [{ from: 600, to: 660 }] } },
    },
  });
  assert.equal(state.manager.createEvent({ start: date('10:00'), end: date('11:00') }), undefined);
  assert.equal(state.host.config.events.length, 0);
  assert.ok(state.manager.createEvent({ start: date('10:00'), end: date('11:00'), allDay: true }));
});

test('Calendar resize proposals clamp the moved edge at special-hours boundaries', () => {
  const result = clampResizeProposedRange({
    proposedStart: date('09:00'),
    proposedEnd: date('11:30'),
    prevStart: date('09:00'),
    prevEnd: date('09:30'),
    disallowed: { hasAny: true, byWeekday: { mon: { default: [{ from: 600, to: 660 }] } } },
    hasSchedules: false,
  });
  assert.equal(result.start.getTime(), date('09:00').getTime());
  assert.equal(result.end.getTime(), date('10:00').getTime());
});
