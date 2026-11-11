/** @jsxImportSource react */
import { InputMask, Space } from '@sdata/web-react';
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
      <Space direction={'vertical'} align={'start'}>
        <InputMask
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          mask={'9999-99-99'}
          maskChar={null}
          placeholder={'YYYY-MM-DD'}
        />
        <span className={'text-sm text-slate-500'}>
          {'当前值：'}
          {formatValue(value || '尚未输入')}
        </span>
      </Space>
    </>
  );
}
