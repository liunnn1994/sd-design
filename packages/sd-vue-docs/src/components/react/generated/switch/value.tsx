/** @jsxImportSource react */
import { Space, Switch } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('');

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Switch
          value={value}
          onChange={(next) => setValue(next as typeof value)}
          checkedValue={'yes'}
          uncheckedValue={'no'}
        />
        <div>
          {'当前值： '}
          {formatValue(value)}
        </div>
      </Space>
    </>
  );
}
