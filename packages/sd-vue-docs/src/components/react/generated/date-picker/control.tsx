/** @jsxImportSource react */
import { DatePicker, RangePicker, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('2026-04-16');
  const [rangeValue, setRangeValue] = useState(['2026-04-16', '2026-04-16']);

  return (
    <>
      <Space>
        <div className={'sd:w-50'}>
          <DatePicker value={value} onValueChange={(next) => setValue(next as typeof value)} />
        </div>
        <div className={'sd:w-75'}>
          <RangePicker
            value={rangeValue}
            onValueChange={(next) => setRangeValue(next as typeof rangeValue)}
          />
        </div>
      </Space>
    </>
  );
}
