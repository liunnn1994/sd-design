import type { CalendarValue, Mode } from '@sdata/web-core/date-picker/types';

import { RangePicker } from '@sdata/web-react/date-picker';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { PickerInputInstance } from '../../src/_shared/picker-input.js';
import '@sdata/web-react/styles/date-picker.scss';

const periodRanges = {
  month: ['2027-07', '2027-08'],
  quarter: ['2027-07', '2027-10'],
  year: ['2027', '2028'],
};

function Fixture() {
  const query = new URLSearchParams(location.search);
  const epoch = query.has('epoch');
  const lifecycle = query.has('lifecycle');
  const boundary = query.get('boundary');
  const sorted = query.get('sorted');
  const mode = (query.get('mode') ?? 'date') as Mode;
  const periodRange =
    mode === 'month' || mode === 'quarter' || mode === 'year' ? periodRanges[mode] : undefined;
  const [mounted, setMounted] = useState(true);
  const initial = query.has('time')
    ? ['2026-11-08 09:30:00', '2026-12-18 17:45:00']
    : ['2026-11-08', '2026-12-18'];
  const [value, setValue] = useState<Array<CalendarValue | undefined> | undefined>(
    epoch ? [0, 86400000] : initial,
  );
  const [accept, setAccept] = useState(false);
  const [locked, setLocked] = useState(query.has('locked') || boundary !== null);
  const [readonly, setReadonly] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [customHeader, setCustomHeader] = useState(false);
  const ref = useRef<PickerInputInstance>(null);
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button
        onClick={() => setValue(epoch ? [86400000, 172800000] : ['2028-02-02', '2028-03-03'])}
      >
        External value
      </button>
      {query.has('draft') && <button onClick={() => setValue([])}>Clear external value</button>}
      {lifecycle && <button onClick={() => setMounted(!mounted)}>Toggle picker</button>}
      <button onClick={() => setLocked(!locked)}>Lock start</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => ref.current?.focus(1)}>Focus end</button>
      <button onClick={() => ref.current?.blur()}>Blur inputs</button>
      {query.has('icons') && (
        <button onClick={() => setCustomHeader(!customHeader)}>Toggle header icon</button>
      )}
      {mounted && (
        <RangePicker
          ref={ref}
          id="range-root"
          className="native-range"
          style={{ width: 450 }}
          mode={mode}
          value={query.has('controlled') || epoch ? value : undefined}
          valueFormat={epoch ? 'timestamp' : undefined}
          utcOffset={epoch ? 0 : undefined}
          defaultPopupVisible={lifecycle}
          popupVisible={query.has('draft') || boundary !== null ? true : undefined}
          unmountOnClose={lifecycle || undefined}
          defaultValue={initial}
          showTime={query.has('time') || epoch}
          showConfirmBtn={query.has('confirm')}
          hideTrigger={query.has('inline')}
          disabled={locked ? [boundary !== 'end', boundary === 'end'] : false}
          readonly={readonly ? 'Locked range' : false}
          separator="to"
          inputProps={[
            {
              'aria-label': 'Start',
              'title': 'Native start',
              'disabled': false,
              'readOnly': false,
            },
            { 'aria-label': 'End', 'title': 'Native end', 'readOnly': false },
          ]}
          headerIcons={
            customHeader
              ? { nextDouble: <span data-testid="next-icon">Next year</span> }
              : undefined
          }
          shortcuts={
            periodRange
              ? [{ label: 'Period range', value: periodRange }]
              : sorted
                ? [{ label: 'Reversed range', value: ['2026-12-15', '2026-11-15'] }]
                : boundary
                  ? [{ label: 'Replace both dates', value: ['2026-11-15', '2026-12-15'] }]
                  : undefined
          }
          disabledDate={
            periodRange
              ? (date) => date.getDate() === 1
              : sorted
                ? (date, type) =>
                    type === 'start' && date.getMonth() === (sorted === 'accept' ? 11 : 10)
                : undefined
          }
          locale={
            query.has('locale')
              ? { rangePlaceholder: { date: ['From custom', 'To custom'] }, ok: 'Confirm range' }
              : undefined
          }
          renderTrigger={
            query.has('custom')
              ? (state) => (
                  <button data-testid="custom">
                    {state.displayValue.join(',')}|{String(state.popupVisible)}
                  </button>
                )
              : undefined
          }
          renderPanel={
            query.has('panel')
              ? ({ component: Panel, props }) => (
                  <section data-testid="custom-panel">
                    <Panel {...props} />
                  </section>
                )
              : undefined
          }
          renderCell={(date, type) => <span data-endpoint={type}>{date.getDate()}</span>}
          extra="Range extra"
          onValueChange={(next) => {
            record(`value:${next?.join(',')}`);
            if (accept) setValue(next);
          }}
          onChange={(next) => record(`change:${next?.join(',')}`)}
          onSelect={(next) => record(`select:${next.join(',')}`)}
          onOk={(next) => record(`ok:${next.join(',')}`)}
        />
      )}
      {lifecycle && <button style={{ display: 'block', marginTop: 500 }}>Outside picker</button>}
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
