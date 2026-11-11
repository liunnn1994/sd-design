import { useMemo, useState } from 'react';

import type { CalendarEventViewProps } from './event.js';
import type { CalendarEvent } from './types.js';

import { CalendarEventView } from './event.js';

export function CalendarEventList({
  events,
  eventProps,
  className,
}: {
  events: CalendarEvent[];
  eventProps(event: CalendarEvent): Omit<CalendarEventViewProps, 'event'>;
  className: string;
}) {
  const current = useMemo(
    () => events.map((event) => ({ event, props: eventProps(event) })),
    [events, eventProps],
  );
  const [retained, setRetained] = useState(current);
  const next = current.concat(
    retained.filter(({ event }) => !events.some((item) => item._.id === event._.id)),
  );
  if (next.length !== retained.length || next.some((entry, index) => entry !== retained[index]))
    setRetained(next);
  if (!retained.length) return null;
  return (
    <div className={className}>
      {retained.map(({ event, props }) => (
        <CalendarEventView
          {...props}
          key={event._.id}
          event={event}
          leaving={!events.some((item) => item._.id === event._.id)}
          onAfterLeave={() =>
            setRetained((items) => items.filter((item) => item.event._.id !== event._.id))
          }
        />
      ))}
    </div>
  );
}
