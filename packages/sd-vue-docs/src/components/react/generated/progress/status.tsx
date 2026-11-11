/** @jsxImportSource react */
import { Progress, Slider, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [percent, setPercent] = useState(0.2);

  return (
    <>
      <Space direction={'vertical'} className={'sd:w-[50%]'}>
        <Progress percent={percent} />
        <Progress status={'warning'} percent={percent} />
        <Progress status={'danger'} percent={percent} />
      </Space>
      <div className={'sd:mt-5'}>
        <Slider
          value={percent}
          onValueChange={(next) => setPercent(next as typeof percent)}
          max={1}
          step={0.1}
          className={'sd:w-37.5'}
        />
      </div>
    </>
  );
}
