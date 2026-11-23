import { Calendar } from '@sdata/web-react/calendar';
import { useState } from 'react';

export function CalendarSpecialHoursFixture() {
  const params = new URLSearchParams(location.search);
  const horizontal = params.has('horizontal');
  const schedules = params.has('schedules');
  const resize = params.has('resize');
  const external = params.has('external');
  const [drops, setDrops] = useState(0);
  const [dropped, setDropped] = useState('');
  return (
    <>
      <Calendar
        view="day"
        viewDate="2025-01-08"
        locale="en"
        horizontal={horizontal}
        timeFrom={540}
        timeTo={1020}
        snapToInterval={30}
        editableEvents
        allDayEvents={external}
        style={{ height: 600, width: 800 }}
        schedules={
          schedules
            ? [
                { id: 1, label: 'Default' },
                { id: 2, label: 'Override' },
              ]
            : undefined
        }
        specialHours={{
          wed: schedules
            ? {
                default: [{ from: 720, to: 780, allowEvents: false, label: 'Closed' }],
                schedules: { 2: [{ from: 720, to: 780, allowEvents: true, label: 'Open' }] },
              }
            : [{ from: 720, to: 780, allowEvents: false, label: 'Closed' }],
        }}
        events={
          resize
            ? [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Resize' }]
            : undefined
        }
        onEventDrop={() => {
          setDrops((value) => value + 1);
          return true;
        }}
        onEventDropped={
          external
            ? (result) => setDropped(`${result.external}:${result.event?.allDay}`)
            : undefined
        }
      />
      <output data-testid="drops">{drops}</output>
      {external && <output data-testid="dropped">{dropped}</output>}
    </>
  );
}
