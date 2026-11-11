import type { CalendarValue, Mode } from '@sdata/web-core/date-picker/types';

import { RangePicker } from '@sdata/web-react/date-picker';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { PickerInputInstance } from '../../src/_shared/picker-input.js';
import '@sdata/web-react/styles/date-picker.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const initial = query.has('time')
    ? ['2026-11-08 09:30:00', '2026-12-18 17:45:00']
    : ['2026-11-08', '2026-12-18'];
  const [value, setValue] = useState<Array<CalendarValue | undefined> | undefined>(initial);
  const [accept, setAccept] = useState(false);
  const [locked, setLocked] = useState(query.has('locked'));
  const [readonly, setReadonly] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const ref = useRef<PickerInputInstance>(null);
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue(['2028-02-02', '2028-03-03'])}>External value</button>
      <button onClick={() => setLocked(!locked)}>Lock start</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => ref.current?.focus(1)}>Focus end</button>
      <button onClick={() => ref.current?.blur()}>Blur inputs</button>
      <RangePicker
        ref={ref}
        id="range-root"
        className="native-range"
        style={{ width: 450 }}
        mode={(query.get('mode') ?? 'date') as Mode}
        value={query.has('controlled') ? value : undefined}
        defaultValue={initial}
        showTime={query.has('time')}
        showConfirmBtn={query.has('confirm')}
        hideTrigger={query.has('inline')}
        disabled={locked ? [true, false] : false}
        readonly={readonly ? 'Locked range' : false}
        separator="to"
        inputProps={[
          { 'aria-label': 'Start', 'title': 'Native start' },
          { 'aria-label': 'End', 'title': 'Native end' },
        ]}
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
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
