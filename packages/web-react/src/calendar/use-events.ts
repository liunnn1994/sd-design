import type { CalendarEventsHost } from '@sdata/web-core/calendar/events-host';

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { CalendarEvent, CalendarEventInput } from './types.js';

import { createCalendarEventsStore } from './events-store.js';

function copyEvents(events: readonly CalendarEventInput[]) {
  return events.map((event) => ({
    ...event,
    start: event.start instanceof Date ? new Date(event.start) : event.start,
    end: event.end instanceof Date ? new Date(event.end) : event.end,
    _: event._
      ? { ...event._, $el: undefined, register: undefined, unregister: undefined }
      : undefined,
    delete: undefined,
    isOverlapping: undefined,
    getOverlappingEvents: undefined,
  })) as unknown as CalendarEvent[];
}

export function useCalendarEvents(
  host: Omit<CalendarEventsHost, 'config'> & {
    config: Omit<CalendarEventsHost['config'], 'events'> & {
      events: readonly CalendarEventInput[];
    };
  },
) {
  const live = useRef(host);
  live.current = host;
  const source = useRef(host.config.events.slice());
  const [store] = useState(() => {
    const initial = copyEvents(host.config.events);
    const config = new Proxy(
      { ...host.config, events: initial },
      {
        get(_target, key) {
          return key === 'events' ? initial : Reflect.get(live.current.config, key);
        },
      },
    );
    return createCalendarEventsStore({
      ...host,
      config,
      emit: (...args) => live.current.emit(...args),
    });
  });
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useLayoutEffect(() => {
    const next = host.config.events;
    if (
      next.length !== source.current.length ||
      next.some((event, index) => event !== source.current[index])
    ) {
      source.current = next.slice();
      store.replaceEvents(copyEvents(next));
    }
  });
  const lifetime = useRef(0);
  useLayoutEffect(() => {
    lifetime.current++;
    return () => {
      const ending = ++lifetime.current;
      // StrictMode reconnects before this microtask; a real unmount releases the controller.
      queueMicrotask(() => {
        if (lifetime.current === ending) store.dispose();
      });
    };
  }, [store]);
  return store;
}
