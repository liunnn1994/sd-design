import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useState } from 'react';

import type { CalendarEventInput } from '../../src/calendar/types.js';

import { resolveCalendarConfig } from '../../src/calendar/config.js';
import { CalendarEventView } from '../../src/calendar/event.js';
import { useCalendarEvents } from '../../src/calendar/use-events.js';
import { useCalendarTexts } from '../../src/calendar/use-texts.js';
const dateUtils = createDateUtils();
const initial: CalendarEventInput[] = [
  {
    start: new Date(2026, 10, 8, 10),
    end: new Date(2026, 10, 8, 11),
    title: 'Planning',
    content: 'Discuss scope',
  },
];
export function CalendarEventFixture() {
  const [events, setEvents] = useState(initial);
  const [month, setMonth] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [custom, setCustom] = useState(false);
  const [fragment, setFragment] = useState(false);
  const [editable, setEditable] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [touch] = useState({ isResizingEvent: false, currentHoveredCell: null });
  const texts = useCalendarTexts({ locale: 'en' });
  const view = {
    id: month ? 'month' : 'day',
    isDay: !month,
    isDays: false,
    isWeek: false,
    isMonth: month,
    isYear: false,
    isYears: false,
  };
  const config = resolveCalendarConfig(
    {
      events,
      view: view.id,
      timeFrom: 540,
      timeTo: 840,
      editableEvents: editable,
      snapToInterval: 30,
    },
    { dateUtils, view },
    {
      onEventClick: () => setLog((old) => [...old, 'click']),
      onEventHold: () => setLog((old) => [...old, 'hold']),
    },
  );
  const store = useCalendarEvents({
    config,
    dateUtils,
    prefixCls: 'sd-calendar',
    touch,
    emit: (name) => setLog((old) => [...old, name]),
  });
  const calendar = {
    prefixCls: 'sd-calendar',
    config,
    view,
    touch,
    dateUtils,
    texts,
    eventsManager: store.manager,
    dnd: {
      eventDragStart() {
        setLog((old) => [...old, 'dragstart']);
      },
      eventDragEnd() {
        setLog((old) => [...old, 'dragend']);
      },
    },
  };
  const event = store.events[0];
  return (
    <>
      <button onClick={() => setMonth(!month)}>Month mode</button>
      <button onClick={() => setAllDay(!allDay)}>All day mode</button>
      <button onClick={() => setCustom(!custom)}>Custom event</button>
      <button onClick={() => setEditable(!editable)}>Edit permission</button>
      <button onClick={() => setMounted(!mounted)}>Mount event</button>
      <button onClick={() => setFragment(!fragment)}>Next fragment</button>
      <button onClick={() => setEvents([{ ...initial[0], end: new Date(2026, 10, 10, 11) }])}>
        Multiday event
      </button>
      <button onClick={() => setLog([])}>Clear log</button>
      <button
        onClick={() => {
          if (event) void event.delete(2);
        }}
      >
        Visual delete
      </button>
      <div className="sd-calendar" style={{ width: 400, height: 320 }}>
        <div className={`sd-calendar__scrollable--${view.id}-view`}>
          <div
            className="sd-calendar__cell"
            data-start={new Date(2026, 10, fragment ? 9 : 8).getTime()}
            style={{ position: 'relative', height: 300 }}
          >
            {mounted && event && (
              <CalendarEventView
                calendar={calendar}
                event={event}
                inAllDayBar={allDay}
                cellStart={new Date(2026, 10, fragment ? 9 : 8)}
                cellEnd={new Date(2026, 10, fragment ? 9 : 8, 23, 59, 59)}
                onDeleted={() => setLog((old) => [...old, 'dom-deleted'])}
                renderEvent={custom ? (value) => `Generic ${value.title}` : undefined}
                renderViewEvent={custom ? { month: (value) => `Month ${value.title}` } : undefined}
                renderAllDayEvent={custom ? (value) => `All day ${value.title}` : undefined}
              />
            )}
          </div>
        </div>
      </div>
      <output data-testid="event-count">{store.events.length}</output>
      <output data-testid="event-registered">{String(!!event?._.$el?.isConnected)}</output>
      <output data-testid="event-end">
        {event ? dateUtils.formatTime(event.end, 'HH:mm') : ''}
      </output>
      <output data-testid="event-log">{log.join('|')}</output>
    </>
  );
}
