import { Calendar, type CalendarExposed, type CalendarOptions } from '@sdata/web-react/calendar';
import { useRef, useState } from 'react';
const initialDate = new Date(2026, 10, 3, 12, 45, 30, 100);
export function CalendarPropBoundariesFixture() {
  const api = useRef<CalendarExposed>(null);
  const [options, setOptions] = useState<CalendarOptions>({
    view: 'month',
    viewDate: initialDate,
    selectedDate: '2026-11-04',
    locale: 'en',
  });
  const [snapshot, setSnapshot] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const epoch = (minimum: boolean) => {
    const date = new Date(0);
    date.setDate(date.getDate() + (minimum ? -1 : 1));
    setOptions({ view: 'day', viewDate: date, [minimum ? 'minDate' : 'maxDate']: new Date(0) });
  };
  return (
    <>
      <button onClick={() => setOptions({ ...options, selectedDate: '' })}>Clear selected</button>
      <button onClick={() => setOptions({ ...options, viewDate: '2026-12-03' })}>December</button>
      <button
        onClick={() =>
          setOptions({
            view: 'days',
            viewDate: '2026-11-03',
            hideWeekdays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          })
        }
      >
        Hide all weekdays
      </button>
      <button
        onClick={() =>
          setOptions({ view: 'day', viewDate: '2026-11-03', views: { bogus: {}, day: {} } })
        }
      >
        Unknown view key
      </button>
      <button onClick={() => epoch(true)}>Epoch minimum</button>
      <button onClick={() => epoch(false)}>Epoch maximum</button>
      <button
        onClick={() =>
          setOptions({ view: 'week', viewDate: '2025-01-08', horizontal: true, hideWeekends: true })
        }
      >
        Horizontal weekdays
      </button>
      <button onClick={() => setOptions({ ...options, hideWeekends: false })}>Show weekends</button>
      <button onClick={() => setOptions({ ...options, horizontal: !options.horizontal })}>
        Change orientation
      </button>
      <button onClick={() => api.current?.view.next()}>Next</button>
      <button
        onClick={() =>
          setSnapshot(
            `${api.current?.view.viewDate.getHours()}:${api.current?.view.viewDate.getMinutes()}:${initialDate.getHours()}:${initialDate.getMilliseconds()}`,
          )
        }
      >
        Read dates
      </button>
      <Calendar
        {...options}
        ref={api}
        style={{ height: 400, width: 700 }}
        onUpdateSelectedDate={() => setSelectedCount((count) => count + 1)}
      />
      <output data-testid="snapshot">{snapshot}</output>
      <output data-testid="selected-count">{selectedCount}</output>
    </>
  );
}
