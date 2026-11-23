import type { CalendarValue } from '@sdata/web-core/date-picker/types';

import { DatePicker as Picker } from '@sdata/web-react/date-picker';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { PickerInputInstance } from '../../src/_shared/picker-input.js';
import '@sdata/web-react/styles/date-picker.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const epoch = query.has('epoch');
  const lifecycle = query.has('lifecycle');
  const [mounted, setMounted] = useState(true);
  const [value, setValue] = useState<CalendarValue | undefined>(epoch ? 0 : '2026-11-08');
  const [accept, setAccept] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [clicks, setClicks] = useState(0);
  const [customHeader, setCustomHeader] = useState(false);
  const [updatedInput, setUpdatedInput] = useState(false);
  const ref = useRef<PickerInputInstance>(null);
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue(epoch ? 86400000 : '2028-02-02')}>External value</button>
      {query.has('draft') && (
        <button onClick={() => setValue(undefined)}>Clear external value</button>
      )}
      {lifecycle && <button onClick={() => setMounted(!mounted)}>Toggle picker</button>}
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => ref.current?.focus()}>Focus input</button>
      <button onClick={() => ref.current?.blur()}>Blur input</button>
      {query.has('icons') && (
        <button onClick={() => setCustomHeader(!customHeader)}>Toggle header icon</button>
      )}
      {query.has('input-props') && (
        <button onClick={() => setUpdatedInput(true)}>Update input attributes</button>
      )}
      {mounted && (
        <Picker
          ref={ref}
          id="root-picker"
          className="custom-root"
          style={{ width: 300 }}
          onClick={() => setClicks((count) => count + 1)}
          value={query.has('controlled') || epoch ? value : undefined}
          valueFormat={epoch ? 'timestamp' : undefined}
          utcOffset={epoch ? 0 : undefined}
          defaultPopupVisible={lifecycle}
          popupVisible={query.has('draft') ? true : undefined}
          unmountOnClose={lifecycle || undefined}
          defaultValue={query.has('time') ? '2026-11-08 09:30:00' : '2026-11-08'}
          defaultPickerValue="2026-11-08"
          showTime={query.has('time') || epoch}
          readonly={readonly ? 'Locked date' : false}
          disabled={disabled}
          showConfirmBtn={query.has('confirm')}
          hideTrigger={query.has('inline')}
          disabledInput={query.has('noinput')}
          fitWidth={query.has('fit')}
          format={query.has('format') ? (date) => `Date ${date.getFullYear()}` : undefined}
          locale={
            query.has('locale')
              ? {
                  placeholder: { date: 'Pick a date' },
                  today: 'Today custom',
                  ok: 'Confirm custom',
                }
              : undefined
          }
          inputProps={{
            'aria-label': updatedInput ? 'Updated appointment' : 'Appointment',
            'title': 'Native date input',
            'maxLength': query.has('input-props') && !updatedInput ? 10 : undefined,
          }}
          headerIcons={
            customHeader
              ? { nextDouble: <span data-testid="next-icon">Next year</span> }
              : undefined
          }
          disabledDate={(date) => date.getDate() === 21}
          shortcuts={[{ label: 'Holiday', value: '2026-12-25' }]}
          extra={<span>Extra footer</span>}
          renderTrigger={
            query.has('custom')
              ? (state) => (
                  <button data-testid="custom">
                    {state.displayValue}|{String(state.popupVisible)}
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
          onValueChange={(next) => {
            record(`value:${next}`);
            if (accept) setValue(next);
          }}
          onChange={(next) => record(`change:${next}`)}
          onSelect={(next) => record(`select:${next}`)}
          onOk={(next) => record(`ok:${next}`)}
          onClear={() => record('clear')}
        />
      )}
      {lifecycle && <button style={{ display: 'block', marginTop: 500 }}>Outside picker</button>}
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="clicks">{clicks}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
