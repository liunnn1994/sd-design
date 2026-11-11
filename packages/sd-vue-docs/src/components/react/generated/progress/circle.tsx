/** @jsxImportSource react */
import { Progress, Slider, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [percent, setPercent] = useState(0.2);

  return (
    <>
      <Space size={'large'}>
        <Progress type={'circle'} percent={percent} />
        <Progress type={'circle'} status={'warning'} percent={percent} />
        <Progress type={'circle'} status={'danger'} percent={percent} />
        <Progress type={'circle'} status={'success'} percent={percent} />
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
