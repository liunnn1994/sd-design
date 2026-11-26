import type { CalendarEventsHost } from '@sdata/web-core/calendar/events-host';

import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CalendarEvent, CalendarEventInput } from '../src/calendar/types.ts';

import { createCalendarEventsStore } from '../dist/calendar/events-store.js';

const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));
function setup(input: CalendarEventInput[] = []) {
  const emitted: string[] = [];
  const host: CalendarEventsHost = {
    config: {
      events: input as CalendarEvent[],
      multidayEvents: true,
      snapToInterval: 0,
      time: true,
      timeFrom: 0,
      timeTo: 1440,
      horizontal: false,
      editableEvents: { delete: true },
      allDayEvents: false,
    },
    dateUtils: createDateUtils(),
    emit: (name) => {
      emitted.push(name);
    },
    prefixCls: 'sd-calendar',
    touch: { isResizingEvent: false, currentHoveredCell: null },
  };
  return { store: createCalendarEventsStore(host), emitted };
}
const event = () => ({
  start: new Date(2026, 10, 8, 9),
  end: new Date(2026, 10, 8, 10),
  title: 'Meeting',
});

test('Calendar event store normalizes and indexes events without wrapping Date objects', async () => {
  const input = event();
  const { store } = setup([input]);
  await tick();
  const first = store.events[0];
  assert.equal(first.start, input.start);
  assert.equal(first.start.getHours(), 9);
  assert.equal(store.manager.getEvent(first._.id), first);
  let updates = 0;
  const unsubscribe = store.subscribe(() => updates++);
  const index = store.manager.eventsIndex.byDate;
  first.title = 'Updated';
  first._.deleting = true;
  await tick();
  assert.equal(updates, 1);
  assert.equal(store.manager.eventsIndex.byDate, index);
  unsubscribe();
  first.title = 'Unsubscribed';
  await tick();
  assert.equal(updates, 1);
});

test('Calendar event store rebuilds membership after creation, replacement and deletion', async () => {
  const { store, emitted } = setup();
  const created = store.manager.createEvent(event());
  assert.ok(created);
  await tick();
  assert.equal(store.manager.getEvent(created._.id)?.title, 'Meeting');
  const replacement = { ...event(), title: 'Replacement' } as CalendarEvent;
  store.replaceEvents([replacement]);
  await tick();
  assert.equal(store.manager.getEvent(created._.id), undefined);
  assert.equal(store.manager.getEvent(replacement._.id)?.title, 'Replacement');
  await store.manager.deleteEvent(replacement._.id, 3);
  await tick();
  assert.equal(store.events.length, 0);
  assert.equal(store.manager.getEvent(replacement._.id), undefined);
  assert.deepEqual(emitted, ['update:events', 'event-delete']);
});

test('Calendar event store keeps multiday events available in intersecting ranges', async () => {
  const { store } = setup([{ start: new Date(2026, 10, 7, 12), end: new Date(2026, 10, 10, 12) }]);
  await tick();
  const result = store.manager.getEventsInRange(new Date(2026, 10, 8), new Date(2026, 10, 9));
  assert.equal(result.length, 1);
  assert.equal(result[0]._.multiday, true);
});

test('Calendar event store cancels queued notifications on disposal', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const removed: string[] = [];
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      removeEventListener(type: string) {
        removed.push(type);
      },
    },
  });
  try {
    const { store } = setup([event()]);
    await tick();
    let updates = 0;
    store.subscribe(() => updates++);
    store.events[0].title = 'Queued';
    store.dispose();
    await tick();
    assert.equal(updates, 0);
    assert.deepEqual(removed.toSorted(), ['pointercancel', 'pointermove', 'pointerup']);
  } finally {
    if (original) Object.defineProperty(globalThis, 'document', original);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
