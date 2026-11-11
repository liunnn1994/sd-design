import { Calendar, type CalendarEvent } from '@sdata/web-react/calendar';
import { useRef, useState } from 'react';
const events = [{ title: 'Resize', start: '2026-11-03 10:00', end: '2026-11-03 11:00' }];
export function CalendarResizeLifecycleFixture() {
  const [mounted, setMounted] = useState(true);
  const [deferEnd, setDeferEnd] = useState(false);
  const [requests, setRequests] = useState(0);
  const [ends, setEnds] = useState(0);
  const [snapshot, setSnapshot] = useState('');
  const approvals = useRef<Array<(accepted: boolean) => void>>([]);
  const original = useRef<CalendarEvent | null>(null);
  const defer = () =>
    new Promise<boolean>((resolve) => {
      approvals.current.push(resolve);
      setRequests((count) => count + 1);
    });
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Mount</button>
      <button onClick={() => setDeferEnd(!deferEnd)}>Defer end</button>
      <button onClick={() => approvals.current[0]?.(true)}>Approve first</button>
      <button onClick={() => approvals.current[1]?.(true)}>Approve second</button>
      <button
        onClick={() => {
          const event = original.current;
          setSnapshot(
            event
              ? `${event.end.getHours()}:${event.end.getMinutes()}:${event._.endTimeFormatted24}`
              : 'none',
          );
        }}
      >
        Read event
      </button>
      {mounted && (
        <Calendar
          view="day"
          viewDate="2026-11-03"
          locale="en"
          editableEvents
          events={events}
          timeFrom={540}
          timeTo={840}
          snapToInterval={30}
          style={{ width: 700, height: 400 }}
          onReady={({ config }) => {
            original.current = config.events[0];
          }}
          onEventResize={() => (deferEnd ? true : defer())}
          onEventResizeEnd={() => {
            setEnds((count) => count + 1);
            return deferEnd ? defer() : true;
          }}
        />
      )}
      <output data-testid="requests">{requests}</output>
      <output data-testid="ends">{ends}</output>
      <output data-testid="snapshot">{snapshot}</output>
    </>
  );
}
