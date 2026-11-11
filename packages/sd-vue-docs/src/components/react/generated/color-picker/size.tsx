/** @jsxImportSource react */
import { ColorPicker, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <ColorPicker defaultValue={'#165DFF'} size={'mini'} />
        <ColorPicker defaultValue={'#165DFF'} size={'small'} />
        <ColorPicker defaultValue={'#165DFF'} size={'medium'} />
        <ColorPicker defaultValue={'#165DFF'} size={'large'} />
      </Space>
    </>
  );
}
