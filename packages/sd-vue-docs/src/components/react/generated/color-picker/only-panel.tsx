/** @jsxImportSource react */
import { ColorPicker, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={32}>
        <ColorPicker defaultValue={'#165DFF'} hideTrigger={true} />
        <ColorPicker defaultValue={'#12D2AC'} disabled={true} hideTrigger={true} />
      </Space>
    </>
  );
}
