import {
  DatePicker,
  WeekPicker,
  MonthPicker,
  QuarterPicker,
  YearPicker,
  ConfigProvider,
  type DatePickerInstance,
} from '@sdata/web-react';
import { RangePicker } from '@sdata/web-react/date-picker';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@sdata/web-react/styles/date-picker.scss';

const modes = {
  date: DatePicker,
  week: WeekPicker,
  month: MonthPicker,
  quarter: QuarterPicker,
  year: YearPicker,
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const mode = (query.get('mode') ?? 'date') as keyof typeof modes;
  const Component = modes[mode];
  const ref = useRef<DatePickerInstance>(null);
  const [exchange, setExchange] = useState(!query.has('noexchange'));
  const [value, setValue] = useState('');
  return (
    <>
      <button onClick={() => ref.current?.focus()}>Focus</button>
      <button onClick={() => setExchange(!exchange)}>Toggle exchange</button>
      <ConfigProvider exchangeTime={exchange} datePicker={{ dayStartOfWeek: 1 }}>
        {query.has('range') ? (
          <RangePicker
            showTime
            defaultValue={['2026-11-08 09:30:00', '2026-12-18 17:45:00']}
            exchangeTime={query.has('localoff') ? false : true}
            onChange={(next) => setValue(next?.join('|') ?? '')}
          />
        ) : (
          <Component
            ref={ref}
            defaultValue={
              mode === 'year'
                ? '2026'
                : mode === 'month' || mode === 'quarter'
                  ? '2026-11'
                  : '2026-11-08'
            }
            onChange={(next) => setValue(String(next))}
          />
        )}
      </ConfigProvider>
      <output data-testid="public-value">{value}</output>
      <output data-testid="compound">
        {String(
          DatePicker.RangePicker === RangePicker &&
            DatePicker.WeekPicker === WeekPicker &&
            DatePicker.MonthPicker === MonthPicker &&
            DatePicker.QuarterPicker === QuarterPicker &&
            DatePicker.YearPicker === YearPicker,
        )}
      </output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
