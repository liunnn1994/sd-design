/** @jsxImportSource react */
import { Slider, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-full'}>
        <Slider defaultValue={10} className={'sd:w-75'} showInput={true} />
        <Slider defaultValue={[10, 20]} className={'sd:w-95'} range={true} showInput={true} />
      </Space>
    </>
  );
}
