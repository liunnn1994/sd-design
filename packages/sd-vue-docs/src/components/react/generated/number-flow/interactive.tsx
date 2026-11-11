/** @jsxImportSource react */
import { continuous } from '@sdata/web-react';
import { Button, NumberFlow, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState(98);
  function randomize() {
    const next = Math.floor(Math.random() * 1_000);
    setValue(next === value ? (next + 1) % 1_000 : next);
  }

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <NumberFlow value={value} plugins={[continuous]} format={{ minimumIntegerDigits: 3 }} />
        <Space>
          <Button
            onClick={() => {
              setValue((previous) => previous - 1);
            }}
          >
            {'减一'}
          </Button>
          <Button
            type={'primary'}
            onClick={() => {
              setValue((previous) => previous + 1);
            }}
          >
            {'加一'}
          </Button>
          <Button onClick={randomize}>{'切换随机数'}</Button>
        </Space>
      </Space>
    </>
  );
}
