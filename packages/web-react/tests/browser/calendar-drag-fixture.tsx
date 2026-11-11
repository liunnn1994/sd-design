import { useRef, useState } from 'react';

import type { CalendarEventInput } from '../../src/calendar/types.js';

import { CalendarBody } from '../../src/calendar/body.js';
import { useCalendar } from '../../src/calendar/use-calendar.js';
const sourceEvents: CalendarEventInput[] = [
  { start: new Date(2026, 10, 3, 10), end: new Date(2026, 10, 3, 11), title: 'Move me' },
];
const empty: CalendarEventInput[] = [];
function DragCalendar({
  id,
  pending,
}: {
  id: string;
  pending: { current: ((value: boolean) => void) | null };
}) {
  const [mode, setMode] = useState('week');
  const [veto, setVeto] = useState(false);
  const [defer, setDefer] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const calendar = useCalendar(
    {
      locale: 'en',
      events: id === 'source' ? sourceEvents : empty,
      view: mode,
      viewDate: '2026-11-03',
      timeFrom: 540,
      timeTo: 840,
      editableEvents: { drag: true, delete: false },
      snapToInterval: 30,
    },
    {
      ready: true,
      emit: (name) => setLog((items) => [...items, name]),
      scrollTop: () => {},
      listeners: {
        onEventDrop: () =>
          defer
            ? new Promise<boolean>((resolve) => {
                pending.current = resolve;
              })
            : !veto,
      },
    },
  );
  const { config, dateUtils, controller } = calendar;
  return (
    <section data-testid={id}>
      <button onClick={() => setVeto(!veto)}>Reject drop</button>
      <button onClick={() => setDefer(!defer)}>Defer drop</button>
      <button onClick={() => setMode(mode === 'week' ? 'month' : 'week')}>Month view</button>
      <div className="sd-calendar" style={{ width: 700 }}>
        <div className={`sd-calendar__scrollable--${controller.state.id}-view`}>
          <CalendarBody calendar={calendar} style={{ height: 300 }} />
        </div>
      </div>
      <output data-testid="drag-events">
        {config.events
          .map(
            (event) =>
              `${event.title}:${dateUtils.formatDateLite(event.start)} ${dateUtils.formatTime(event.start, 'HH:mm')}-${dateUtils.formatTime(event.end, 'HH:mm')}`,
          )
          .join('|')}
      </output>
      <output data-testid="drag-count">{config.events.length}</output>
      <output data-testid="drag-view">{controller.state.id}</output>
      <output data-testid="drag-log">{log.join('|')}</output>
    </section>
  );
}
export function CalendarDragFixture() {
  const [target, setTarget] = useState(true);
  const pending = useRef<((value: boolean) => void) | null>(null);
  return (
    <>
      <button onClick={() => setTarget(!target)}>Mount target</button>
      <button onClick={() => pending.current?.(true)}>Accept pending drop</button>
      <DragCalendar id="source" pending={pending} />
      {target && <DragCalendar id="target" pending={pending} />}
    </>
  );
}
