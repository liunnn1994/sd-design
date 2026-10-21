import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CalendarDragHost } from '../dist/calendar/drag-host.js';
import type { CalendarEventsHost } from '../dist/calendar/events-host.js';
import type { CalendarCell, CalendarEventInput } from '../dist/calendar/types.js';

import { createCalendarDragSession } from '../dist/calendar/drag-and-drop.js';
import { createCalendarEvents } from '../dist/calendar/events.js';
import { createDateUtils } from '../dist/calendar/utils/date.js';

const date = (time: string, day = '2026-10-19') => new Date(`${day}T${time}:00`);
const cell = (): CalendarCell => ({ start: date('00:00'), end: date('23:59') });

function fixture(
  session = createCalendarDragSession(),
  uid = 'source',
  inputs: CalendarEventInput[] = [],
) {
  let rebuild = () => {};
  const cleanup: (() => void)[] = [];
  const emitted: unknown[][] = [];
  const switches: unknown[][] = [];
  const config: CalendarEventsHost['config'] & CalendarDragHost['config'] = {
    events: inputs as CalendarEventsHost['config']['events'],
    horizontal: false,
    time: true,
    timeStep: 30,
    timeFrom: 540,
    timeTo: 840,
    snapToInterval: 0,
    multidayEvents: true,
    allDayEvents: false,
    editableEvents: { delete: false },
    eventListeners: { event: {} },
  };
  const touch = { isDraggingEvent: false, isResizingEvent: false, currentHoveredCell: null };
  const emit: CalendarDragHost['emit'] = (...args) => {
    emitted.push(args);
  };
  const eventsManager = createCalendarEvents(
    { config, touch, emit, prefixCls: 'sd-calendar', dateUtils: createDateUtils() },
    {
      createState: (state) => state,
      createIndex: (state) => state,
      observeEvents: (callback) => {
        rebuild = callback;
        callback();
      },
      onDispose: () => {},
    },
  );
  const view = {
    id: 'day',
    firstCellDate: date('00:00'),
    narrowerView: 'day',
    switch(id: string, next?: Date | string) {
      switches.push([id, next]);
      this.id = id;
      if (next) this.firstCellDate = new Date(next);
    },
  };
  const host: CalendarDragHost = {
    uid,
    prefixCls: 'sd-calendar',
    config,
    touch,
    emit,
    eventsManager,
    view,
  };
  return {
    host,
    config,
    view,
    touch,
    emitted,
    switches,
    eventsManager,
    rebuild: () => rebuild(),
    dispose: () => cleanup.forEach((stop) => stop()),
    dnd: session(host, { onDispose: (stop) => cleanup.push(stop) }),
  };
}

function dragEvent(data = new Map<string, string>(), schedule?: string) {
  let prevented = 0;
  const classes = new Set(['sd-calendar__cell']);
  const element = {
    nodeType: 1,
    dataset: schedule === undefined ? {} : { schedule },
    clientWidth: 100,
    clientHeight: 100,
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100 }),
    contains: () => false,
    classList: {
      add: (value: string) => classes.add(value),
      remove: (value: string) => classes.delete(value),
      contains: (value: string) => classes.has(value),
    },
    closest: (selector: string) =>
      selector === '[data-schedule]' && schedule === undefined ? null : element,
  };
  const event = {
    target: element,
    currentTarget: element,
    relatedTarget: null,
    clientX: 68,
    clientY: 68,
    offsetX: 8,
    offsetY: 8,
    preventDefault: () => {
      prevented++;
    },
    dataTransfer: {
      effectAllowed: '',
      dropEffect: '',
      getData: (key: string) => data.get(key) ?? '',
      setData: (key: string, value: string) => data.set(key, value),
    },
  } as unknown as DragEvent;
  return { event, element, classes, data, prevented: () => prevented };
}

test('Calendar drag serializes dates and metadata and rejects resize/text drags', () => {
  const state = fixture(undefined, 'source', [
    { start: date('10:00'), end: date('11:00'), title: 'Original' },
  ]);
  const source = state.config.events[0],
    native = dragEvent();
  state.touch.isResizingEvent = true;
  state.dnd.eventDragStart(native.event, source);
  assert.equal(native.prevented(), 1);
  assert.equal(native.data.size, 0);
  state.touch.isResizingEvent = false;
  state.dnd.eventDragStart(native.event, source);
  const payload = JSON.parse(native.data.get('event')!);
  assert.equal(payload.title, 'Original');
  assert.equal(payload._.id, source._.id);
  assert.equal(payload._.duration, 60);
  assert.equal(native.data.get('cursor-grab-at'), '8');
  assert.equal(state.touch.isDraggingEvent, true);
  state.dnd.eventDragEnd(native.event, source);
  assert.equal(state.touch.isDraggingEvent, false);
});

test('Calendar internal drop preserves object identity, numeric schedule id and refreshed metadata', async () => {
  const state = fixture(undefined, 'source', [
    { start: date('10:00'), end: date('11:00'), schedule: 1 },
  ]);
  state.config.schedules = [{ id: 0 }, { id: '0' }];
  const event = state.config.events[0],
    native = dragEvent(undefined, '0');
  state.dnd.eventDragStart(native.event, event);
  await state.dnd.cellDragDrop(native.event, cell());
  assert.equal(state.config.events[0], event);
  assert.equal(event.schedule, 0);
  assert.equal(event.start.getHours(), 12);
  assert.equal(event._.startTimeFormatted24, '12:00');
  assert.equal(state.emitted.at(-1)?.[0], 'event-dropped');
  state.dnd.eventDragEnd(native.event, event);
});

test('Calendar accepted cross-calendar drop removes source independently of delete permission', async () => {
  const session = createCalendarDragSession();
  const source = fixture(session, 'source', [{ start: date('10:00'), end: date('11:00') }]);
  const target = fixture(session, 'target');
  const native = dragEvent();
  source.dnd.eventDragStart(native.event, source.config.events[0]);
  await target.dnd.cellDragDrop(native.event, cell());
  target.rebuild();
  assert.equal(source.config.events.length, 0);
  assert.equal(target.config.events.length, 1);
  assert.deepEqual(
    source.emitted.slice(-2).map((args) => args[0]),
    ['update:events', 'event-delete'],
  );
  assert.equal(target.config.events[0].start.getHours(), 12);
});

test('Calendar cross-calendar rejection keeps source and emits a rejected drop result', async () => {
  const session = createCalendarDragSession();
  const source = fixture(session, 'source', [{ start: date('10:00'), end: date('11:00') }]);
  const target = fixture(session, 'target');
  target.config.eventListeners.event.drop = async () => false;
  const native = dragEvent();
  source.dnd.eventDragStart(native.event, source.config.events[0]);
  await target.dnd.cellDragDrop(native.event, cell());
  assert.equal(source.config.events.length, 1);
  assert.equal(target.config.events.length, 0);
  assert.equal(target.emitted.at(-1)?.[0], 'event-dropped');
});

test('Calendar delayed cross-calendar approval retains source removal after dragend', async () => {
  const session = createCalendarDragSession();
  const source = fixture(session, 'source', [{ start: date('10:00'), end: date('11:00') }]);
  const target = fixture(session, 'target');
  let approve!: (value: boolean) => void;
  target.config.eventListeners.event.drop = () =>
    new Promise<boolean>((resolve) => {
      approve = resolve;
    });
  const native = dragEvent(),
    event = source.config.events[0];
  source.dnd.eventDragStart(native.event, event);
  const pending = target.dnd.cellDragDrop(native.event, cell());
  source.dnd.eventDragEnd(native.event, event);
  assert.equal(source.config.events.length, 1);
  approve(true);
  await pending;
  assert.equal(source.config.events.length, 0);
  assert.equal(target.config.events.length, 1);
});

test('Calendar target disposal invalidates a pending drop without changing either events array', async () => {
  const session = createCalendarDragSession();
  const source = fixture(session, 'source', [{ start: date('10:00'), end: date('11:00') }]);
  const target = fixture(session, 'target');
  let approve!: (value: boolean) => void;
  target.config.eventListeners.event.drop = () =>
    new Promise<boolean>((resolve) => {
      approve = resolve;
    });
  const native = dragEvent();
  source.dnd.eventDragStart(native.event, source.config.events[0]);
  const pending = target.dnd.cellDragDrop(native.event, cell());
  target.dispose();
  approve(true);
  await pending;
  assert.equal(source.config.events.length, 1);
  assert.equal(target.config.events.length, 0);
  assert.equal(target.emitted.length, 0);
});

test('Calendar source disposal prevents a captured source-removal callback from mutating old data', async () => {
  const session = createCalendarDragSession();
  const source = fixture(session, 'source', [{ start: date('10:00'), end: date('11:00') }]);
  const target = fixture(session, 'target');
  let approve!: (value: boolean) => void;
  target.config.eventListeners.event.drop = () =>
    new Promise<boolean>((resolve) => {
      approve = resolve;
    });
  const native = dragEvent();
  source.dnd.eventDragStart(native.event, source.config.events[0]);
  const pending = target.dnd.cellDragDrop(native.event, cell());
  source.dispose();
  approve(true);
  await pending;
  assert.equal(source.config.events.length, 1);
  assert.equal(target.config.events.length, 1);
});

test('Calendar external all-day drop uses cell bounds and allows handler changes except metadata', async () => {
  const target = fixture();
  const native = dragEvent();
  native.data.set('event', JSON.stringify({ title: 'External', duration: 45 }));
  target.config.eventListeners.event.drop = (value) => {
    const event = (value as { event: CalendarEventsHost['config']['events'][number] }).event;
    return { ...event, title: 'Modified', _: { ...event._, id: 'replace-id' } };
  };
  const range = cell();
  await target.dnd.cellDragDrop(native.event, range, true);
  const event = target.config.events[0];
  assert.equal(event.allDay, true);
  assert.equal(event.start.getTime(), range.start.getTime());
  assert.equal(event.title, 'Modified');
  assert.notEqual(event._.id, 'replace-id');
});

test('Calendar disallowed timed drops skip external approval but allow all-day drops', async () => {
  const target = fixture();
  let calls = 0;
  target.config.specialHoursDisallowed = {
    hasAny: true,
    byWeekday: { mon: { default: [{ from: 720, to: 840 }] } },
  };
  target.config.eventListeners.event.drop = () => {
    calls++;
  };
  const native = dragEvent();
  native.data.set('event', JSON.stringify({ duration: 30 }));
  await target.dnd.cellDragDrop(native.event, cell());
  assert.equal(calls, 0);
  assert.equal(target.config.events.length, 0);
  await target.dnd.cellDragDrop(native.event, cell(), true);
  assert.equal(calls, 1);
  assert.equal(target.config.events.length, 1);
});

test('Calendar hover navigation waits two seconds and cancelled drag restores the original view', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const state = fixture(undefined, 'source', [{ start: date('10:00'), end: date('11:00') }]);
  state.view.id = 'month';
  const native = dragEvent(),
    event = state.config.events[0],
    range = cell();
  state.dnd.eventDragStart(native.event, event);
  state.dnd.cellDragEnter(native.event, range);
  context.mock.timers.tick(1999);
  assert.equal(state.switches.length, 0);
  context.mock.timers.tick(1);
  assert.equal(state.switches[0][0], 'day');
  state.dnd.eventDragEnd(native.event, event);
  assert.equal(state.switches[1][0], 'month');
  assert.equal(range.highlighted, false);
  assert.equal(range.highlightedSchedule, null);
});

test('Calendar leaving or disposing a hovered cell cancels its pending navigation', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const state = fixture();
  state.view.id = 'month';
  const native = dragEvent(),
    range = cell();
  state.dnd.cellDragEnter(native.event, range);
  state.dnd.cellDragLeave(native.event, range);
  context.mock.timers.tick(2000);
  assert.equal(state.switches.length, 0);
  assert.equal(range.highlighted, false);
  state.dnd.cellDragEnter(native.event, range);
  state.dispose();
  context.mock.timers.tick(2000);
  assert.equal(state.switches.length, 0);
  assert.equal(range.highlighted, false);
});

test('Calendar independent sessions do not remove each other source data', async () => {
  const source = fixture(undefined, 'source', [{ start: date('10:00'), end: date('11:00') }]);
  const target = fixture();
  const native = dragEvent();
  source.dnd.eventDragStart(native.event, source.config.events[0]);
  await target.dnd.cellDragDrop(native.event, cell());
  assert.equal(source.config.events.length, 1);
  assert.equal(target.config.events.length, 1);
});
