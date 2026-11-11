import type { Mode } from '@sdata/web-core/date-picker/types';

import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DatePickerContext } from '../../src/date-picker/context.js';
import { DatePickerPanel } from '../../src/date-picker/picker-panel.js';
import { useDateHeader } from '../../src/date-picker/use-date-header.js';
import { useI18n } from '../../src/locale/index.js';
import '../../styles/time-picker.scss';
import '@sdata/web-core/styles/date-picker/style/index.scss';

function HeaderFixture() {
  const [value, setValue] = useState('2026-11-08');
  const [accept, setAccept] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const controlled = new URLSearchParams(location.search).has('controlled');
  const header = useDateHeader({
    mode: 'date',
    format: 'YYYY-MM-DD',
    value: controlled ? value : undefined,
    defaultValue: '2026-11-08',
    onChange: (next) => {
      setEvents((items) => [...items, next.format('YYYY-MM-DD')]);
      if (accept) setValue(next.format('YYYY-MM-DD'));
    },
  });
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue('2028-02-02')}>External header</button>
      <button onClick={header.operations.onNext}>Next month</button>
      <button onClick={() => header.resetValue(false)}>Silent reset</button>
      <output data-testid="header">{header.value.format('YYYY-MM-DD')}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}

function PanelFixture() {
  const query = new URLSearchParams(location.search);
  const mode = (query.get('mode') ?? 'date') as Mode;
  const position = (query.get('position') ?? 'bottom') as 'left' | 'bottom' | 'right';
  const [header, setHeader] = useState(dayjs('2026-11-08'));
  const [headerMode, setHeaderMode] = useState<'year' | 'month'>();
  const [confirm, setConfirm] = useState(query.has('confirm'));
  const [locked, setLocked] = useState(false);
  const [calls, setCalls] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const { t } = useI18n();
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <DatePickerContext.Provider value={{ datePickerT: t }}>
      <button onClick={() => setHeader(dayjs('2044-03-04'))}>External header</button>
      <button onClick={() => setConfirm(!confirm)}>Confirm mode</button>
      <button onClick={() => setLocked(!locked)}>Lock confirmation</button>
      <DatePickerPanel
        prefixCls="sd-picker"
        mode={mode}
        headerMode={headerMode}
        headerValue={header}
        format="YYYY-MM-DD"
        hideTrigger
        now={dayjs('2026-11-08 09:30:00')}
        showNowBtn
        showConfirmBtn={confirm}
        confirmBtnDisabled={locked}
        shortcutsPosition={position}
        shortcuts={
          query.has('shortcuts')
            ? [
                {
                  label: 'Deferred date',
                  value: () => {
                    setCalls((count) => count + 1);
                    return '2026-12-25';
                  },
                },
              ]
            : []
        }
        extra={<span>Extra content</span>}
        onHeaderLabelClick={setHeaderMode}
        onMonthHeaderClick={() => setHeaderMode('year')}
        onHeaderSelect={(date) => {
          setHeader(
            header.year(date.year()).month(headerMode === 'month' ? date.month() : header.month()),
          );
          setHeaderMode(headerMode === 'year' ? 'month' : undefined);
        }}
        onCellClick={(date) => record(`date:${date.format('YYYY-MM-DD')}`)}
        onConfirm={() => record('confirm')}
        onTodayClick={(date) => record(`now:${date.format('YYYY-MM-DD HH:mm:ss')}`)}
        onShortcutClick={(date) => record(`shortcut:${date.format('YYYY-MM-DD')}`)}
        onShortcutMouseEnter={(date) => record(`enter:${date.format('YYYY-MM-DD')}`)}
        onShortcutMouseLeave={(date) => record(`leave:${date.format('YYYY-MM-DD')}`)}
      />
      <output data-testid="calls">{calls}</output>
      <output data-testid="events">{events.join('|')}</output>
    </DatePickerContext.Provider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {new URLSearchParams(location.search).has('header') ? <HeaderFixture /> : <PanelFixture />}
  </StrictMode>,
);
