import type { Dayjs } from 'dayjs';

import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  useDateTimeValue,
  useRangeDateTimeValue,
} from '../../src/date-picker/use-date-time-value.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const twelve = query.has('twelve');
  const [defaults, setDefaults] = useState(
    twelve ? ['01:15:30 pm', '05:45:20 pm'] : ['09:15:30', '17:45:20'],
  );
  const [selected, setSelected] = useState<Array<Dayjs | undefined>>([]);
  const format = query.has('invalid') ? '[]' : twelve ? 'hh:mm:ss a' : 'HH:mm:ss';
  const single = useDateTimeValue(selected[0], {
    defaultValue: defaults[0],
    format,
    use12Hours: twelve,
  });
  const range = useRangeDateTimeValue(selected, {
    defaultValue: defaults,
    format,
    use12Hours: twelve,
  });
  return (
    <>
      <button
        onClick={() => setSelected([dayjs('2026-11-08 12:00:00'), dayjs('2026-11-08 19:00:00')])}
      >
        Select
      </button>
      <button onClick={() => setSelected([])}>Clear selection</button>
      <button onClick={() => setDefaults(['08:00:00', '20:00:00'])}>New defaults</button>
      <button
        onClick={() => {
          single.resetValue();
          range.resetValue();
        }}
      >
        Reset
      </button>
      <button
        onClick={() => {
          single.setValue(dayjs('2026-11-08 15:00:00'));
          range.setValue([undefined, dayjs('2026-11-08 21:00:00')]);
        }}
      >
        Partial update
      </button>
      <button
        onClick={() => {
          single.setValue(undefined);
          range.setValue(undefined);
        }}
      >
        Undefined update
      </button>
      <output data-testid="single">{single.value.format('HH:mm:ss')}</output>
      <output data-testid="range">
        {range.value.map((value) => value.format('HH:mm:ss')).join(',')}
      </output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
