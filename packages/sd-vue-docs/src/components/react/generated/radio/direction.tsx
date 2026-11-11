/** @jsxImportSource react */
import { Radio, RadioGroup } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <RadioGroup direction={'vertical'}>
        <Radio value={'A'}>{'A'}</Radio>
        <Radio value={'B'}>{'B'}</Radio>
        <Radio value={'C'}>{'C'}</Radio>
        <Radio value={'D'}>{'D'}</Radio>
      </RadioGroup>
    </>
  );
}
