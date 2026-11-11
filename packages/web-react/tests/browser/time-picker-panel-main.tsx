import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { TimePanel } from '../../src/time-picker/panel.js';
import { TimeRangePanel } from '../../src/time-picker/range-panel.js';
import { TimeColumn } from '../../src/time-picker/time-column.js';
import '../../styles/button.scss';
import '@sdata/web-core/styles/time-picker/style/index.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState(dayjs('09:15:30', 'HH:mm:ss'));
  const [selected, setSelected] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const [visible, setVisible] = useState(true);
  const [hide, setHide] = useState(false);
  const [columnValue, setColumnValue] = useState(30);
  const [removed, setRemoved] = useState(false);
  const [rangeValue, setRangeValue] = useState<Array<ReturnType<typeof dayjs> | undefined>>([
    value,
  ]);
  const [index, setIndex] = useState(0);
  const step = query.has('step') ? Number(query.get('step')) : 1;
  return (
    <div>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => setValue(dayjs('18:45:20', 'HH:mm:ss'))}>External value</button>
      <button onClick={() => setVisible(!visible)}>Visible</button>
      <button onClick={() => setHide(!hide)}>Hide disabled</button>
      <button onClick={() => setRemoved(true)}>Remove option</button>
      <button onClick={() => setColumnValue(29)}>Select 29</button>
      <button onClick={() => setColumnValue(30)}>Select 30</button>
      <div className="sd-timepicker-container" style={{ width: 300 }}>
        {query.has('column') ? (
          <div className="sd-timepicker">
            <TimeColumn
              prefix="sd-timepicker"
              visible={visible}
              value={columnValue}
              list={Array.from({ length: 60 }, (_, n) => ({ value: n, label: String(n) })).filter(
                (item) => !removed || item.value !== 30,
              )}
              onSelect={(next) => setColumnValue(Number(next))}
            />
          </div>
        ) : query.has('range') ? (
          <TimeRangePanel
            visible
            value={rangeValue}
            displayIndex={index}
            onSelect={setRangeValue}
            onConfirm={(next) =>
              setConfirmed(next?.map((item) => item.format('HH:mm:ss')).join('|') ?? '')
            }
            onDisplayIndexChange={setIndex}
          />
        ) : (
          <TimePanel
            value={value}
            visible={visible}
            disabled={disabled}
            use12Hours={query.has('12')}
            format={query.has('12') ? 'hh:mm:ss A' : 'HH:mm:ss'}
            step={{ hour: step, minute: step, second: step }}
            hideDisabledOptions={hide}
            disabledHours={() => [10]}
            onSelect={(next) => setSelected(next.format('HH:mm:ss'))}
            onConfirm={(next) => setConfirmed(next.format('HH:mm:ss'))}
            extra={<span>Extra footer</span>}
          />
        )}
      </div>
      <output data-testid="selected">{selected}</output>
      <output data-testid="confirmed">{confirmed}</output>
      <output data-testid="index">{index}</output>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
