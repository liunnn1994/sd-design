/** @jsxImportSource react */
import { Button, NumberFlow, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [compactValue, setCompactValue] = useState(9_876_543);
  const [progress, setProgress] = useState(0.856);
  function randomize() {
    setCompactValue(Math.floor(Math.random() * 100_000_000));
    setProgress(Math.random());
  }

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <NumberFlow
          value={compactValue}
          locales={'zh-CN'}
          format={{ notation: 'compact', maximumFractionDigits: 1 }}
        />
        <NumberFlow
          value={progress}
          format={{ style: 'percent', minimumFractionDigits: 1 }}
          prefix={'完成 '}
        />
        <Button type={'primary'} onClick={randomize}>
          {'切换随机数'}
        </Button>
      </Space>
    </>
  );
}
