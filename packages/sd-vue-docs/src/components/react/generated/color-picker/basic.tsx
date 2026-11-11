/** @jsxImportSource react */
import { ColorPicker, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('#165DFF');

  return (
    <>
      <Space>
        <ColorPicker
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          clearable={true}
        />
        <ColorPicker defaultValue={'#165DFF'} enableAlpha={true} format={'RGBA'} />
      </Space>
    </>
  );
}
