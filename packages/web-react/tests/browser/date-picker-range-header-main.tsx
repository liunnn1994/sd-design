import type { Mode } from '@sdata/web-core/date-picker/types';

import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useRangeDateHeader } from '../../src/date-picker/use-range-date-header.js';

function Header({ onChange, onRemove }: { onChange(value: string): void; onRemove(): void }) {
  const query = new URLSearchParams(location.search);
  const [value, setValue] = useState(['2026-11-08', '2026-12-08']);
  const [accept, setAccept] = useState(false);
  const [selected, setSelected] = useState(() =>
    query.has('selected') ? [dayjs('2027-03-01'), dayjs('2026-01-01')] : [],
  );
  const header = useRangeDateHeader({
    mode: (query.get('mode') ?? 'date') as Mode,
    value: query.has('controlled') ? value : undefined,
    defaultValue: ['2026-11-08', '2026-11-08'],
    selectedValue: selected,
    format: 'YYYY-MM-DD',
    onChange: (next) => {
      const formatted = next.map((date) => date.format('YYYY-MM-DD'));
      onChange(formatted.join(','));
      if (accept) setValue(formatted);
    },
  });
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue(['2028-02-01', '2028-06-01'])}>External headers</button>
      <button disabled={!header.startOperations.onNext} onClick={header.startOperations.onNext}>
        Start next
      </button>
      <button disabled={!header.endOperations.onPrev} onClick={header.endOperations.onPrev}>
        End previous
      </button>
      <button onClick={header.endOperations.onNext}>End next</button>
      <button onClick={() => header.setValue([dayjs('2028-02-01'), dayjs('2028-04-01')])}>
        Set both
      </button>
      <button
        onClick={() => {
          setSelected([dayjs('2030-08-01'), dayjs('2030-08-01')]);
          header.resetValue();
        }}
      >
        Replace selection and reset
      </button>
      <button
        onClick={() => {
          header.resetValue();
          onRemove();
        }}
      >
        Reset and unmount
      </button>
      <output data-testid="headers">
        {header.startValue.format('YYYY-MM-DD')},{header.endValue.format('YYYY-MM-DD')}
      </output>
    </>
  );
}
function Fixture() {
  const [visible, setVisible] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  return (
    <>
      {visible && (
        <Header
          onRemove={() => setVisible(false)}
          onChange={(value) => setEvents((items) => [...items, value])}
        />
      )}
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
