/** @jsxImportSource react */
import { ColorPicker, Radio, RadioGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type DemoFormat = 'HEX' | 'RGBA' | 'HSL' | 'HSV' | 'CSS';
  const [format, setFormat] = useState<DemoFormat>('RGBA');
  const formatList: DemoFormat[] = ['HEX', 'RGBA', 'HSL', 'HSV', 'CSS'];

  return (
    <>
      <Space direction={'vertical'}>
        <RadioGroup
          type={'button'}
          value={format}
          onValueChange={(next) => setFormat(next as typeof format)}
        >
          {formatList.map((item) => (
            <Radio value={item}>{formatValue(item)}</Radio>
          ))}
        </RadioGroup>
        <ColorPicker defaultValue={'#165DFF'} format={format} enableAlpha={true} />
      </Space>
    </>
  );
}
