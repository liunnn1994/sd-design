/** @jsxImportSource react */
import { Button, Space, ThinkingOrb } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <>
      <Space direction={'vertical'} align={'start'}>
        <ThinkingOrb state={'solving'} paused={paused} speed={speed} />
        <Space>
          <Button
            onClick={() => {
              setPaused(!paused);
            }}
          >
            {formatValue(paused ? '继续' : '暂停')}
          </Button>
          <Button
            onClick={() => {
              setSpeed(speed === 1 ? 1.8 : 1);
            }}
          >
            {'切换速度'}
          </Button>
        </Space>
      </Space>
    </>
  );
}
