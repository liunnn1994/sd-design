/** @jsxImportSource react */
import { Button, NumberFlow, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [integer, setInteger] = useState(123456.78);
  const [percent, setPercent] = useState(0.42);
  const [currency, setCurrency] = useState(1299);
  function randomize() {
    setInteger(Math.random() * 1_000_000);
    setPercent(Math.random());
    setCurrency(Math.random() * 10_000);
  }

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Space size={'large'}>
          <NumberFlow value={integer} />
          <NumberFlow value={percent} format={{ style: 'percent' }} />
          <NumberFlow
            value={currency}
            locales={'zh-CN'}
            format={{ style: 'currency', currency: 'CNY' }}
          />
        </Space>
        <Button type={'primary'} onClick={randomize}>
          {'切换随机数'}
        </Button>
      </Space>
    </>
  );
}
