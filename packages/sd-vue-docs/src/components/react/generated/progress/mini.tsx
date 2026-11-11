/** @jsxImportSource react */
import { Progress, Slider, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [percent, setPercent] = useState(0.2);

  return (
    <>
      <Space size={'large'} className={'sd:w-full'}>
        <Progress size={'mini'} percent={percent} />
        <Progress size={'mini'} status={'warning'} percent={percent} />
        <Progress size={'mini'} status={'danger'} percent={percent} />
        <Progress size={'mini'} status={'success'} percent={percent} />
      </Space>
      <Space size={'large'} className={'sd:w-full sd:mt-5'}>
        <Progress type={'circle'} size={'mini'} percent={percent} />
        <Progress type={'circle'} size={'mini'} status={'warning'} percent={percent} />
        <Progress type={'circle'} size={'mini'} status={'danger'} percent={percent} />
        <Progress type={'circle'} size={'mini'} status={'success'} percent={percent} />
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
