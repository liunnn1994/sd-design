/** @jsxImportSource react */
import { Slider, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space align={'start'}>
        <Slider defaultValue={50} direction={'vertical'} />
        <Slider
          direction={'vertical'}
          defaultValue={5}
          className={'sd:w-75'}
          max={15}
          marks={{
            5: '5km',
            10: '10km',
          }}
        />
      </Space>
    </>
  );
}
