import type { CalendarValue } from '@sdata/web-core/date-picker/types';

import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useDatePicker } from '../../src/date-picker/use-date-picker.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [value, setValue] = useState<CalendarValue | undefined>('2026-11-08');
  const [accept, setAccept] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [popup, setPopup] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const showTime = query.has('time');
  const record = (text: string) => setEvents((items) => [...items, text]);
  const state = useDatePicker({
    value: query.has('controlled') ? value : undefined,
    defaultValue: showTime ? '2026-11-08 09:30:00' : '2026-11-08',
    showConfirm: query.has('confirm'),
    showTime,
    readonly,
    disabled,
    popupVisible: query.has('popup') ? popup : undefined,
    disabledDate: (date) => date.getDate() === 21,
    onValueChange: (next) => {
      record(`value:${next}`);
      if (accept) setValue(next);
    },
    onChange: (next, date, text) => record(`change:${next}:${date instanceof Date}:${text}`),
    onSelect: (next) => record(`select:${next}`),
    onOk: (next) => record(`ok:${next}`),
    onClear: () => record('clear'),
    onSelectShortcut: (item) => record(`shortcut:${item.label}`),
    onPopupVisibleChange: (next) => {
      record(`popup:${next}`);
      if (accept) setPopup(next);
    },
  });
  const foundation = state.foundation;
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue('2028-02-02')}>External value</button>
      <button onClick={() => setValue(undefined)}>Release value</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => foundation.onPanelVisibleChange(true)}>Open</button>
      <button onClick={() => foundation.onPanelVisibleChange(false)}>Close</button>
      <button onClick={() => foundation.onPanelCellClick(dayjs('2026-12-20'))}>Select date</button>
      <button onClick={() => foundation.onPanelCellClick(dayjs('2026-12-21'))}>
        Disabled date
      </button>
      <button onClick={foundation.onPanelConfirm}>Confirm</button>
      <button onClick={foundation.onInputClear}>Clear</button>
      <button onClick={() => foundation.onTimePickerSelect(dayjs('2026-11-08 18:45:20'))}>
        Select time
      </button>
      <button onClick={() => foundation.onPanelShortcutMouseEnter(dayjs('2026-12-25'))}>
        Preview
      </button>
      <button onClick={foundation.onPanelShortcutMouseLeave}>Leave preview</button>
      <button
        onClick={() =>
          foundation.onPanelShortcutClick(dayjs('2026-12-25'), {
            label: 'Holiday',
            value: '2026-12-25',
          })
        }
      >
        Shortcut
      </button>
      <button onClick={() => foundation.onPanelHeaderLabelClick('year')}>Year header</button>
      <button onClick={() => foundation.onPanelHeaderSelect(dayjs('2030-03-01'))}>
        Select header
      </button>
      <input
        aria-label="Draft"
        value={state.local.draft ?? ''}
        onChange={(event) => foundation.onInputChange(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') foundation.onInputPressEnter();
        }}
      />
      <output data-testid="value">{state.value?.format(state.format) ?? ''}</output>
      <output data-testid="panel">{state.panelValue?.format(state.format) ?? ''}</output>
      <output data-testid="popup">{String(state.visible)}</output>
      <output data-testid="header-mode">{state.local.headerMode ?? ''}</output>
      <output data-testid="header">{state.header.value.format('YYYY-MM-DD')}</output>
      <output data-testid="confirm-disabled">{String(state.confirmDisabled)}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
