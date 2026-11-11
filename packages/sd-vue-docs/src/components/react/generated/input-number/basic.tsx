/** @jsxImportSource react */
import { InputNumber, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState(15);

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputNumber
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          placeholder={'请输入'}
          className={'input-demo sd:w-80'}
          min={10}
          max={100}
        />
        <InputNumber placeholder={'请输入'} className={'input-demo sd:w-80'} min={10} max={100} />
        <InputNumber
          placeholder={'请输入'}
          defaultValue={500}
          className={'input-demo sd:w-80'}
          disabled={true}
        />
      </Space>
    </>
  );
}
