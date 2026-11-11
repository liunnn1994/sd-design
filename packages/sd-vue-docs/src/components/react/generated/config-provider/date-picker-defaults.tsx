/** @jsxImportSource react */
import type { ConfigProviderProps } from '@sdata/web-react';

import { ConfigProvider, DatePicker, RangePicker } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [dateValue, setDateValue] = useState('2026-04-16 08:00:00');
  const [rangeValue, setRangeValue] = useState(['2026-04-16 08:00:00', '2026-04-18 18:00:00']);
  const [monthRangeValue, setMonthRangeValue] = useState(['2026-04', '2026-09']);
  const datePickerDefaults = {
    shortcuts: [
      {
        label: '今天',
        value: () => new Date(),
      },
      {
        label: '7 天后',
        value: () => {
          const date = new Date();
          date.setDate(date.getDate() + 7);
          return date;
        },
      },
      {
        label: '30 天后',
        value: () => {
          const date = new Date();
          date.setDate(date.getDate() + 30);
          return date;
        },
      },
    ],
    shortcutsPosition: 'right',
    previewShortcut: true,
    showConfirmBtn: true,
    showNowBtn: false,
    dayStartOfWeek: 1,
    abbreviation: false,
  } satisfies NonNullable<ConfigProviderProps['datePicker']>;

  return (
    <>
      <ConfigProvider data-v-38add796="" datePicker={datePickerDefaults}>
        <div data-v-38add796="" className={'config-provider-date-picker-demo'}>
          <DatePicker
            data-v-38add796=""
            value={dateValue}
            onValueChange={(next) => setDateValue(next as typeof dateValue)}
            showTime={true}
            className={'sd:w-52'}
          />
          <RangePicker
            data-v-38add796=""
            value={rangeValue}
            onValueChange={(next) => setRangeValue(next as typeof rangeValue)}
            showTime={true}
            className={'sd:w-88'}
          />
          <RangePicker
            data-v-38add796=""
            value={monthRangeValue}
            onValueChange={(next) => setMonthRangeValue(next as typeof monthRangeValue)}
            mode={'month'}
            className={'sd:w-88'}
          />
        </div>
      </ConfigProvider>
      <style>
        {
          '\n.config-provider-date-picker-demo[data-v-38add796] {\n    display: grid;\n    gap: 12px;\n}\n'
        }
      </style>
    </>
  );
}
