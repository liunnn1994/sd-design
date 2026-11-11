import type { CalendarValue } from '@sdata/web-core/date-picker/types';

import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { PickerInputInstance } from '../../src/_shared/picker-input.js';

import { useRangePicker } from '../../src/date-picker/use-range-picker.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const showTime = query.has('time');
  const initial = query.has('empty')
    ? []
    : showTime
      ? ['2026-11-08 09:00:00', '2026-11-18 17:00:00']
      : ['2026-11-08', '2026-11-18'];
  const [value, setValue] = useState<Array<CalendarValue | undefined> | undefined>(initial);
  const [accept, setAccept] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [locked, setLocked] = useState(query.has('locked'));
  const [events, setEvents] = useState<string[]>([]);
  const first = useRef<HTMLInputElement>(null);
  const second = useRef<HTMLInputElement>(null);
  const input = useRef<PickerInputInstance>({
    focus: (index = 0) => (index === 0 ? first : second).current?.focus(),
    blur: () => {
      first.current?.blur();
      second.current?.blur();
    },
  });
  const record = (event: string) => setEvents((items) => [...items, event]);
  const state = useRangePicker(
    {
      value: query.has('controlled') ? value : undefined,
      defaultValue: initial,
      showTime,
      showConfirm: query.has('confirm'),
      readonly,
      disabled: locked ? [true, false] : false,
      exchangeTime: !query.has('noexchange'),
      fixedTime: query.has('fixed'),
      clearRangeOnReselect: query.has('reselect'),
      onValueChange: (next) => {
        record(`value:${next?.join(',')}`);
        if (accept) setValue(next);
      },
      onChange: (next) => record(`change:${next?.join(',')}`),
      onSelect: (next) => record(`select:${next.join(',')}`),
      onOk: (next) => record(`ok:${next.join(',')}`),
      onClear: () => record('clear'),
    },
    input,
  );
  const f = state.foundation;
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue(['2028-02-02', '2028-03-03'])}>External value</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setLocked(!locked)}>Lock start</button>
      <button onClick={() => f.onPanelVisibleChange(true)}>Open</button>
      <button onClick={() => f.onPanelVisibleChange(false)}>Close</button>
      <button onClick={() => f.onPanelCellClick(dayjs('2026-11-20'))}>Select 20</button>
      <button onClick={() => f.onPanelCellClick(dayjs('2026-11-25'))}>Select 25</button>
      <button onClick={f.onPanelConfirm}>Confirm</button>
      <button onClick={f.onInputClear}>Clear</button>
      <button
        onClick={() => f.onPanelShortcutMouseEnter([dayjs('2027-01-01'), dayjs('2027-02-01')])}
      >
        Preview
      </button>
      <button onClick={f.onPanelShortcutMouseLeave}>Leave preview</button>
      <button
        onClick={() =>
          f.onPanelShortcutClick([dayjs('2026-11-20 09:00:00'), dayjs('2026-11-01 18:00:00')], {
            label: 'Reverse',
            value: [],
          })
        }
      >
        Reverse shortcut
      </button>
      {[0, 1].map((index) => (
        <input
          key={index}
          ref={index === 0 ? first : second}
          aria-label={`Draft ${index}`}
          disabled={state.disabledInputs[index]}
          value={state.local.draft?.[index] ?? ''}
          onClick={() => state.setFocusedIndex(index)}
          onChange={(event) => f.onInputChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') f.onInputPressEnter();
          }}
        />
      ))}
      <output data-testid="value">
        {state.value.map((date) => date?.format(state.format) ?? '').join(',')}
      </output>
      <output data-testid="panel">
        {state.panelValue.map((date) => date?.format(state.format) ?? '').join(',')}
      </output>
      <output data-testid="index">{state.local.index}</output>
      <output data-testid="popup">{String(state.visible)}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
