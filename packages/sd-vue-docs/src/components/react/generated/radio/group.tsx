/** @jsxImportSource react */
import { Radio, RadioGroup, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup>
          <Radio value={'A'}>{'A'}</Radio>
          <Radio value={'B'}>{'B'}</Radio>
          <Radio value={'C'}>{'C'}</Radio>
          <Radio value={'D'}>{'D'}</Radio>
        </RadioGroup>
        <RadioGroup>
          <Radio value={'A'}>{'A'}</Radio>
          <Radio value={'B'}>{'B'}</Radio>
          <Radio value={'C'}>{'C'}</Radio>
          <Radio value={'D'} disabled={true}>
            {'D'}
          </Radio>
        </RadioGroup>
      </Space>
    </>
  );
}
