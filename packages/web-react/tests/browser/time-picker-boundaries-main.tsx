import { TimePicker } from '@sdata/web-react/time-picker';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@sdata/web-react/styles/time-picker.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [events, setEvents] = useState<string[]>([]);
  const [clicks, setClicks] = useState(0);
  const initialFormat = query.has('meridiem')
    ? 'hh:mm:ss a'
    : query.has('literal')
      ? 'HH:mm [seconds]'
      : 'HH:mm:ss';
  const [format, setFormat] = useState(initialFormat);
  const initialValue = query.has('meridiem')
    ? '01:30:00 pm'
    : query.has('literal')
      ? '13:30 seconds'
      : query.has('epoch')
        ? 0
        : '13:30:00';
  const [hours, setHours] = useState(false);
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <div>
      <button onClick={() => setHours(!hours)}>Toggle twelve hour</button>
      <button onClick={() => setFormat('HH:mm')}>Short format</button>
      <TimePicker
        defaultValue={initialValue}
        defaultPopupVisible={!query.has('layout')}
        format={format}
        use12Hours={query.has('12') || hours}
        step={query.has('step') ? { hour: 2, minute: 10, second: 15 } : undefined}
        disabledHours={query.has('disabled') ? () => [0, 12, 14] : undefined}
        disabledMinutes={query.has('callbacks') ? (hour) => (hour === 13 ? [45] : []) : undefined}
        disabledSeconds={
          query.has('callbacks')
            ? (hour, minute) => (hour === 13 && minute === 30 ? [20] : [])
            : undefined
        }
        hideDisabledOptions={query.has('hide')}
        type={query.has('range') ? 'time-range' : 'time'}
        readonly={query.has('layout')}
        className="picker-layout"
        style={{ width: 194, marginRight: 24, marginBottom: 20 }}
        onClick={() => setClicks((count) => count + 1)}
        onChange={(value, date) =>
          record(
            `change:${value}|date:${Array.isArray(date) ? date.every((item) => item instanceof Date) : date instanceof Date}`,
          )
        }
        onSelect={(value, date) =>
          record(
            `select:${value}|date:${Array.isArray(date) ? date.every((item) => item instanceof Date) : date instanceof Date}`,
          )
        }
      />
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="clicks">{clicks}</output>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
