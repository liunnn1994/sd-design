import { useRef, useState } from 'react';

import type { CalendarEventInput } from '../../src/calendar/types.js';

import { CalendarBody } from '../../src/calendar/body.js';
import { useCalendar } from '../../src/calendar/use-calendar.js';

const initial: CalendarEventInput[] = [
  { title: 'Visible', start: '2026-11-03 10:00', end: '2026-11-03 11:00' },
  { title: 'Outside', start: '2026-12-03 10:00', end: '2026-12-03 11:00' },
];
export function CalendarAdapterFixture() {
  const [horizontal, setHorizontal] = useState(false);
  const [locale, setLocale] = useState('en');
  const [timeFrom, setTimeFrom] = useState(540);
  const [scrolled, setScrolled] = useState(-1);
  const [log, setLog] = useState<string[]>([]);
  const calendar = useCalendar(
    {
      view: 'week',
      viewDate: '2026-11-03',
      events: initial,
      locale,
      horizontal,
      timeFrom,
      timeTo: 840,
      timeCellHeight: 40,
      timeStep: 30,
      editableEvents: true,
    },
    {
      ready: true,
      emit: (name) => setLog((items) => [...items, name]),
      listeners: {},
      scrollTop: setScrolled,
    },
  );
  const firstView = useRef(calendar.view);
  return (
    <>
      <button onClick={() => firstView.current.switch('month')}>Month</button>
      <button onClick={() => firstView.current.switch('week')}>Week</button>
      <button onClick={() => firstView.current.next()}>Next</button>
      <button onClick={() => firstView.current.previous()}>Previous</button>
      <button onClick={() => setHorizontal(!horizontal)}>Horizontal</button>
      <button onClick={() => setLocale(locale === 'en' ? 'zh-cn' : 'en')}>Locale</button>
      <button onClick={() => setTimeFrom(600)}>Start at ten</button>
      <button onClick={() => firstView.current.scrollToTime(660)}>Scroll eleven</button>
      <button onClick={() => firstView.current.scrollTop()}>Scroll top</button>
      <button
        onClick={() =>
          firstView.current.createEvent({
            title: 'Created',
            start: new Date(2026, 10, 3, 12),
            end: new Date(2026, 10, 3, 13),
          })
        }
      >
        Create
      </button>
      <button onClick={() => firstView.current.deleteEvent({ title: 'Created' }, 3)}>
        Delete created
      </button>
      <div className="sd-calendar" style={{ width: 700 }}>
        <CalendarBody calendar={calendar} style={{ height: 300 }} />
      </div>
      <output data-testid="view">{firstView.current.id}</output>
      <output data-testid="horizontal">{String(calendar.config.horizontal)}</output>
      <output data-testid="events">
        {firstView.current.events.map((event) => event.title).join('|')}
      </output>
      <output data-testid="input">{JSON.stringify(initial)}</output>
      <output data-testid="scroll">{scrolled}</output>
      <output data-testid="locale">{calendar.texts.dateLocale}</output>
      <output data-testid="log">{log.join('|')}</output>
    </>
  );
}
