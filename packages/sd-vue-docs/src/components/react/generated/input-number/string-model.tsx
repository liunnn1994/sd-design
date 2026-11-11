/** @jsxImportSource react */
import { InputNumber, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [stringValue, setStringValue] = useState('12');

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputNumber
          value={stringValue}
          onValueChange={(next) => setStringValue(next as typeof stringValue)}
          mode={'button'}
          allowClear={true}
          placeholder={'请输入数字'}
          className={'input-demo sd:w-80'}
        />
        <div>
          {'当前值：'}
          {formatValue(stringValue === '' ? '空字符串' : stringValue)}
        </div>
        <div>
          {'值类型：'}
          {formatValue(typeof stringValue)}
        </div>
      </Space>
    </>
  );
}
