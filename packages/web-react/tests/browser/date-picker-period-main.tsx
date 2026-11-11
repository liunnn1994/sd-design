import { dayjs } from '@sdata/web-core/_utils/date';
import {
  createDateHeader,
  getPanelSpan,
  getPanelSuperSpan,
} from '@sdata/web-core/date-picker/header';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DatePickerContext } from '../../src/date-picker/context.js';
import { DatePeriodPanel, type DatePeriodPanelProps } from '../../src/date-picker/period-panel.js';
import { useI18n } from '../../src/locale/index.js';
import '@sdata/web-core/styles/style/index.scss';
import '@sdata/web-core/styles/_components/picker/style/index.scss';
import '@sdata/web-core/styles/date-picker/style/index.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const mode = (query.get('mode') ?? 'month') as DatePeriodPanelProps['mode'];
  const [header, setHeader] = useState(dayjs('2026-01-01'));
  const [value, setValue] = useState(dayjs('2026-08-15'));
  const [events, setEvents] = useState<string[]>([]);
  const [abbreviation, setAbbreviation] = useState(true);
  const { t } = useI18n();
  const foundation = createDateHeader({
    mode,
    value: header,
    span: getPanelSpan(mode),
    superSpan: getPanelSuperSpan(mode),
    setLocalValue: setHeader,
    onChange: (next) => setEvents((items) => [...items, `header:${next.year()}`]),
  });
  return (
    <DatePickerContext.Provider value={{ datePickerT: t }}>
      <button onClick={() => setAbbreviation(!abbreviation)}>Full month names</button>
      <DatePeriodPanel
        mode={mode}
        headerValue={header}
        headerOperations={foundation.getOperations()}
        value={value}
        abbreviation={abbreviation}
        disabledDate={
          query.has('restricted') ? (date) => query.has('all') || date.getDate() === 1 : undefined
        }
        onSelect={(next) => {
          setValue(next);
          setEvents((items) => [...items, `select:${next.format('YYYY-MM-DD')}`]);
        }}
        onHeaderLabelClick={(label) => setEvents((items) => [...items, label])}
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
