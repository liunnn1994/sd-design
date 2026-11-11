import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useState } from 'react';

import type { CalendarEvent } from '../../src/calendar/types.js';

import { useCalendarEvents } from '../../src/calendar/use-events.js';

const initial = [
  { start: new Date(2026, 10, 8, 9, 0, 23), end: new Date(2026, 10, 8, 10), title: 'Original' },
] as CalendarEvent[];
const dateUtils = createDateUtils();
function Events({ events, record }: { events: CalendarEvent[]; record(name: string): void }) {
  const [deletable, setDeletable] = useState(true);
  const [touch] = useState({ isResizingEvent: false, currentHoveredCell: null });
  const store = useCalendarEvents({
    config: {
      events,
      multidayEvents: true,
      snapToInterval: 30,
      time: true,
      timeFrom: 0,
      timeTo: 1440,
      horizontal: false,
      editableEvents: { delete: deletable },
      allDayEvents: false,
    },
    dateUtils,
    emit: (name) => record(name),
    prefixCls: 'sd-calendar',
    touch,
  });
  return (
    <>
      <button
        onClick={() =>
          store.manager.createEvent({
            start: '2026-11-08 12:08',
            end: '2026-11-08 13:08',
            title: 'Created',
          })
        }
      >
        Create event
      </button>
      <button onClick={() => setDeletable(!deletable)}>Deletion enabled</button>
      <ul>
        {store.events.map((event) => (
          <li key={event._.id}>
            {event.title}:{event.start.getHours()}:{event.start.getMinutes()}
            <button
              onClick={() => {
                void event.delete(3);
              }}
            >
              Delete {event.title}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
export function CalendarEventsFixture() {
  const [events, setEvents] = useState(initial);
  const [mounted, setMounted] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  return (
    <section data-testid="calendar-events-fixture">
      <button onClick={() => setMounted(!mounted)}>Mount events</button>
      <button onClick={() => setEvents([{ ...initial[0], title: 'Replacement' }])}>
        Replace events
      </button>
      <button
        onClick={() =>
          setEvents([
            { start: '2026-11-09', end: '2026-11-10', title: 'Date only' },
          ] as unknown as CalendarEvent[])
        }
      >
        Replace string date
      </button>
      {mounted && <Events events={events} record={(name) => setLog((old) => [...old, name])} />}
      <output data-testid="calendar-events-log">{log.join('|')}</output>
      <output data-testid="calendar-events-source">
        {String(initial[0]._)}:{initial[0].start.getSeconds()}
      </output>
    </section>
  );
}
