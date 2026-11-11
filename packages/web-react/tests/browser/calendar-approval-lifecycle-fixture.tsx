import {
  Calendar,
  type CalendarEventCreate,
  type CalendarExposed,
  type CalendarState,
} from '@sdata/web-react/calendar';
import { useRef, useState } from 'react';

export function CalendarApprovalLifecycleFixture() {
  const api = useRef<CalendarExposed>(null);
  const original = useRef<CalendarState['config'] | null>(null);
  const [pending, setPending] = useState<CalendarEventCreate | null>(null);
  const [mounted, setMounted] = useState(true);
  const [snapshot, setSnapshot] = useState('');
  const [created, setCreated] = useState(0);
  return (
    <>
      <button onClick={() => api.current?.view.next()}>Navigate</button>
      <button onClick={() => api.current?.view.previous()}>Return</button>
      <button onClick={() => setMounted(!mounted)}>Mount</button>
      <button
        onClick={() => {
          pending?.resolve({ ...pending.event, title: 'Approved' });
          setPending(null);
        }}
      >
        Approve
      </button>
      <button
        onClick={() => {
          pending?.resolve(false);
          setPending(null);
        }}
      >
        Reject
      </button>
      <button
        onClick={() =>
          setSnapshot(
            original.current?.events
              .map(
                (event) =>
                  `${event.start.getDate()}:${event._.startTimeFormatted24}-${event._.endTimeFormatted24}`,
              )
              .join('|') ?? '',
          )
        }
      >
        Read store
      </button>
      {mounted && (
        <Calendar
          ref={api}
          view="day"
          viewDate="2026-11-03"
          locale="en"
          editableEvents
          timeFrom={540}
          timeTo={840}
          snapToInterval={30}
          style={{ height: 400, width: 700 }}
          onReady={({ config }) => {
            original.current = config;
          }}
          onEventCreate={setPending}
          onEventCreated={() => setCreated((value) => value + 1)}
        />
      )}
      <output data-testid="pending">{pending ? 'pending' : 'none'}</output>
      <output data-testid="snapshot">{snapshot}</output>
      <output data-testid="created">{created}</output>
    </>
  );
}
