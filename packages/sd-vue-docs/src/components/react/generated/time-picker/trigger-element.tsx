/** @jsxImportSource react */
import { Button, TimePicker } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('09:30:00');

  return (
    <>
      <TimePicker
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        renderTrigger={({ displayValue, popupVisible }) => (
          <>
            <Button type={'primary'}>
              {formatValue(displayValue || '选择时间')}
              {'（'}
              {formatValue(popupVisible ? '收起' : '展开')}
              {'） '}
            </Button>
          </>
        )}
      />
    </>
  );
}
