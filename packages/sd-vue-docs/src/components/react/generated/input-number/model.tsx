/** @jsxImportSource react */
import { InputNumber } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState(15);

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <InputNumber
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          placeholder={'请输入'}
          className={'input-demo sd:w-80'}
          min={10}
          max={100}
          modelEvent={'input'}
        />
        <div>
          {'当前值： '}
          {formatValue(value)}
        </div>
      </div>
    </>
  );
}
