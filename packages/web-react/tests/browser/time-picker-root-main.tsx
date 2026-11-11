import {
  TimePicker,
  type TimePickerInstance,
  type TimeInputValue,
} from '@sdata/web-react/time-picker';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@sdata/web-react/styles/time-picker.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const range = query.has('range');
  const [value, setValue] = useState<TimeInputValue>(range ? ['09:00:00', '17:00:00'] : '09:00:00');
  const [accept, setAccept] = useState(!query.has('reject'));
  const [disabled, setDisabled] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [visible, setVisible] = useState(query.has('open'));
  const [events, setEvents] = useState<string[]>([]);
  const ref = useRef<TimePickerInstance>(null);
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <div>
      <button onClick={() => setAccept(!accept)}>Accept</button>
      <button onClick={() => setValue(range ? ['08:00:00', '18:00:00'] : '18:00:00')}>
        External value
      </button>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setVisible(!visible)}>External popup</button>
      <button onClick={() => ref.current?.focus(range ? 1 : undefined)}>Focus input</button>
      <TimePicker
        ref={ref}
        type={range ? 'time-range' : 'time'}
        {...(query.has('controlled')
          ? {
              value: Array.isArray(value)
                ? value.filter((item): item is string => item !== undefined)
                : value,
            }
          : { defaultValue: range ? ['09:00:00', '17:00:00'] : '09:00:00' })}
        defaultPopupVisible={query.has('open')}
        popupVisible={query.has('popup') ? visible : undefined}
        disableConfirm={query.has('instant')}
        disabled={disabled}
        readonly={readonly ? 'Time is locked' : false}
        disabledHours={() => [10]}
        onValueChange={(next) => {
          record(`value:${next}`);
          if (accept) setValue(next);
        }}
        onChange={(next) => record(`change:${next}`)}
        onSelect={(next) => record(`select:${next}`)}
        onClear={() => record('clear')}
        onPopupVisibleChange={(next) => record(`popup:${next}`)}
        onUpdatePopupVisible={(next) => {
          if (accept) setVisible(next);
        }}
        renderTrigger={
          query.has('custom')
            ? (context) => (
                <button data-testid="custom">
                  {String(context.displayValue)}|{String(context.popupVisible)}
                </button>
              )
            : undefined
        }
      />
      <output data-testid="value">{JSON.stringify(value)}</output>
      <output data-testid="events">{events.join('|')}</output>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
