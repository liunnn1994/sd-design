import { Calendar } from '@sdata/web-react/calendar';
import { useRef, useState } from 'react';

import type { CalendarExposed } from '../../src/calendar/root-types.js';
const events = [{ title: 'Meeting', start: '2026-11-03 10:00', end: '2026-11-03 11:00' }];
export function CalendarRootFixture() {
  const api = useRef<CalendarExposed>(null);
  const [ready, setReady] = useState(0);
  const [mounted, setMounted] = useState(true);
  const [diy, setDiy] = useState(false);
  const [custom, setCustom] = useState(false);
  const [wholeCell, setWholeCell] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [callbackPayload, setCallbackPayload] = useState('');
  const [selected, setSelected] = useState('');
  const [view, setView] = useState('');
  return (
    <>
      <button onClick={() => api.current?.view.scrollToTime(600)}>Scroll ten</button>
      <button onClick={() => api.current?.view.scrollTop()}>Scroll top</button>
      <button onClick={() => api.current?.view.next()}>API next</button>
      <button onClick={() => setMounted(!mounted)}>Mount</button>
      <button onClick={() => setDiy(!diy)}>DIY</button>
      <button onClick={() => setCustom(!custom)}>Custom</button>
      <button onClick={() => setWholeCell(!wholeCell)}>Whole cell</button>
      {mounted && (
        <Calendar
          ref={api}
          id="calendar-root"
          className="custom-root"
          aria-label="Appointments"
          style={{ width: 700, height: 400 }}
          locale="en"
          view="week"
          viewDate="2026-11-03"
          events={events}
          editableEvents
          weekNumbers
          onReady={({ config }) => {
            if (config.ready) setReady((n) => n + 1);
          }}
          onUpdateView={setView}
          onUpdateSelectedDate={(date) => setSelected(date.toISOString())}
          onCellClick={({ cell, view, cursor }) => {
            setClicks((count) => count + 1);
            setCallbackPayload(`${view.id}:${cell.start.getDate()}:${cursor.date instanceof Date}`);
          }}
          onEventClick={({ e, event }) =>
            setCallbackPayload(`${e.type}:${event.title}:${event._.duration}`)
          }
          renderCell={
            wholeCell ? (cell) => <b data-testid="whole-cell">{cell.start.getDate()}</b> : undefined
          }
          renderEventCount={wholeCell ? () => <b data-testid="hidden-count">hidden</b> : undefined}
          renderDiy={
            diy
              ? (calendar) => (
                  <button data-testid="diy" onClick={() => calendar.view.switch('day')}>
                    {calendar.view.id}
                  </button>
                )
              : undefined
          }
          renderTitle={
            custom
              ? (current) => (
                  <span data-testid="title">
                    {current.id}:{current.events.length}
                  </span>
                )
              : undefined
          }
          renderEvent={custom ? (event) => <b data-testid="event">{event.title}</b> : undefined}
          renderWeekNumber={
            custom ? (number) => <b data-testid="week-number">W{number}</b> : undefined
          }
        />
      )}
      <output data-testid="ready">{ready}</output>
      <output data-testid="view">{view}</output>
      <output data-testid="selected">{selected}</output>
      <output data-testid="clicks">{clicks}</output>
      <output data-testid="callback-payload">{callbackPayload}</output>
    </>
  );
}
