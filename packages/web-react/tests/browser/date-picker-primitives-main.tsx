import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DatePickerContext } from '../../src/date-picker/context.js';
import { DatePanelBody } from '../../src/date-picker/panel-body.js';
import { DatePanelHeader } from '../../src/date-picker/panel-header.js';
import '@sdata/web-core/styles/style/index.scss';
import '@sdata/web-core/styles/_components/picker/style/index.scss';
import '@sdata/web-core/styles/date-picker/style/index.scss';

function Fixture() {
  const [date, setDate] = useState(dayjs('2026-11-08'));
  const [custom, setCustom] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [week, setWeek] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const record = (event: string) => setEvents((items) => [...items, event]);
  const cells = [7, 8, 9, 10].map((n) => ({
    value: dayjs(`2026-11-${n}`),
    label: n,
    isPrev: n === 7,
  }));
  return (
    <DatePickerContext.Provider
      value={{
        datePickerT: (key) =>
          ({ 'datePicker.yearFormat': 'YYYY[年]', 'datePicker.monthFormat': 'MM[月]' })[key] ?? key,
      }}
    >
      <button onClick={() => setCustom(!custom)}>Custom icons</button>
      <button onClick={() => setHidden(!hidden)}>Show outer dates</button>
      <button onClick={() => setWeek(!week)}>Week mode</button>
      <div className="sd-panel-date-inner">
        <DatePanelHeader
          prefixCls="sd-picker"
          title="Fallback"
          value={date}
          mode={week ? 'week' : 'date'}
          onNext={() => setDate((value) => value.add(1, 'month'))}
          onPrev={() => setDate((value) => value.subtract(1, 'month'))}
          onLabelClick={(label) => record(label)}
          icons={
            custom ? { next: <span>Next custom</span>, prev: <span>Prev custom</span> } : undefined
          }
        />
        <DatePanelBody
          prefixCls="sd-picker"
          rows={[cells]}
          mode={week ? 'week' : 'date'}
          value={date}
          now={dayjs('2026-11-08')}
          rangeValues={[cells[3].value, cells[1].value]}
          isSameTime={(a, b) => a.isSame(b, week ? 'week' : 'day')}
          disabledDate={(value) => value.getDate() === 9}
          hideNotInViewDates={hidden}
          onCellClick={(cell) => record(`click:${cell.label}`)}
          onCellMouseEnter={(cell) => record(`hover:${cell.label}`)}
          renderCell={(value) => (
            <div className="sd-picker-date">
              <div className="sd-picker-date-value">{value.getDate()}</div>
            </div>
          )}
        />
      </div>
      <output data-testid="events">{events.join('|')}</output>
    </DatePickerContext.Provider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
