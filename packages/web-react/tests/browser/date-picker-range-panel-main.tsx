import type { Mode } from '@sdata/web-core/date-picker/types';

import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DatePickerContext } from '../../src/date-picker/context.js';
import { DateRangePickerPanel } from '../../src/date-picker/range-picker-panel.js';
import { useI18n } from '../../src/locale/index.js';
import '../../styles/time-picker.scss';
import '@sdata/web-core/styles/date-picker/style/index.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const mode = (query.get('mode') ?? 'date') as Mode;
  const position = (query.get('position') ?? 'bottom') as 'left' | 'bottom' | 'right';
  const [visible, setVisible] = useState(true);
  const [locked, setLocked] = useState(false);
  const [headerMode, setHeaderMode] = useState<'year' | 'month'>();
  const [value, setValue] = useState([dayjs('2026-11-08 09:30:00'), dayjs('2026-12-20 17:45:00')]);
  const [events, setEvents] = useState<string[]>([]);
  const [calls, setCalls] = useState(0);
  const { t } = useI18n();
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <DatePickerContext.Provider value={{ datePickerT: t }}>
      <button onClick={() => setVisible(!visible)}>Toggle visibility</button>
      <button onClick={() => setLocked(!locked)}>Lock</button>
      <button onClick={() => setHeaderMode('year')}>Year header</button>
      <button onClick={() => setHeaderMode('month')}>Month header</button>
      <DateRangePickerPanel
        prefixCls="sd-picker"
        mode={mode}
        format="YYYY-MM-DD"
        value={value}
        footerValue={value}
        timePickerValue={value}
        visible={visible}
        startHeaderProps={{ headerValue: dayjs('2026-11-01') }}
        endHeaderProps={{ headerValue: dayjs('2026-12-01') }}
        startHeaderMode={headerMode}
        showTime={query.has('time')}
        hideTrigger
        hideNotInViewDates
        showConfirmBtn
        confirmBtnDisabled={locked}
        disabled={[locked, false]}
        shortcutsPosition={position}
        shortcuts={
          query.has('shortcuts')
            ? [
                {
                  label: 'Deferred range',
                  value: () => {
                    setCalls((count) => count + 1);
                    return ['2026-12-24', '2026-12-25'];
                  },
                },
              ]
            : []
        }
        disabledDate={(date, type) => date.getDate() === (type === 'start' ? 9 : 10)}
        disabledTime={(_date, type) => ({ disabledHours: () => [type === 'start' ? 10 : 11] })}
        renderCell={(date, type) => <span data-endpoint={type}>{date.getDate()}</span>}
        extra="Range footer"
        onCellClick={(date) => record(`cell:${date.format('YYYY-MM-DD')}`)}
        onCellMouseEnter={(date) => record(`hover:${date.format('YYYY-MM-DD')}`)}
        onStartHeaderSelect={(date) => record(`header:${date.year()}`)}
        onTimePickerSelect={(time, type) => {
          setValue((current) =>
            current.map((date, index) => (index === (type === 'start' ? 0 : 1) ? time : date)),
          );
          record(`${type}:${time.format('HH:mm:ss')}`);
        }}
        onShortcutClick={(dates) =>
          record(`shortcut:${dates.map((date) => date.format('YYYY-MM-DD')).join(',')}`)
        }
        onConfirm={() => record('confirm')}
      />
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="calls">{calls}</output>
      <output data-testid="visible">{String(visible)}</output>
    </DatePickerContext.Provider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
