import type { WeekStart } from '@sdata/web-core/date-picker/types';

import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DateCalendarPanel } from '../../src/date-picker/calendar-panel.js';
import { DatePickerContext } from '../../src/date-picker/context.js';
import { useI18n } from '../../src/locale/index.js';
import '../../styles/time-picker.scss';
import '@sdata/web-core/styles/date-picker/style/index.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [date, setDate] = useState(dayjs('2026-11-08 09:30:00'));
  const [hidden, setHidden] = useState(true);
  const [view, setView] = useState<'date' | 'time'>('date');
  const [events, setEvents] = useState<string[]>([]);
  const { t } = useI18n();
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <DatePickerContext.Provider value={{ datePickerT: t }}>
      <button onClick={() => setHidden(!hidden)}>Outer dates</button>
      <button onClick={() => setDate(dayjs('2026-11-08 18:45:20'))}>External clock</button>
      <button onClick={() => setView('time')}>External view</button>
      <DateCalendarPanel
        headerValue={dayjs('2026-11-01')}
        value={date}
        footerValue={date}
        timePickerValue={date}
        mode={query.has('week') ? 'week' : 'date'}
        dayStartOfWeek={Number(query.get('start') ?? 0) as WeekStart}
        showTime={query.has('time')}
        isRange={query.has('range')}
        currentView={query.has('controlled') ? view : undefined}
        onCurrentViewChange={(next) => record(`view:${next}`)}
        onUpdateCurrentView={(next) => {
          if (!query.has('reject')) setView(next);
        }}
        hideNotInViewDates={hidden}
        disabledDate={(value) => value.getDate() === 9}
        disabledTime={() => ({ disabledHours: () => [10] })}
        onSelect={(next) => record(`date:${next.format('YYYY-MM-DD')}`)}
        onTimePickerSelect={(next) => {
          setDate(next);
          record(`time:${next.format('HH:mm:ss')}`);
        }}
      />
      <output data-testid="events">{events.join('|')}</output>
    </DatePickerContext.Provider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
