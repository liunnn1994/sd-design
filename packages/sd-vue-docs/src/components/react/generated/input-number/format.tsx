/** @jsxImportSource react */
import type { InputNumberFormatter, InputNumberParser } from '@sdata/web-react';

import { InputNumber } from '@sdata/web-react';

export default function Example() {
  const formatter: InputNumberFormatter = (value) => {
    const normalizedValue = String(value ?? '');
    const values = normalizedValue.split('.');
    values[0] = values[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return values.join('.');
  };
  const parser: InputNumberParser = (value) => {
    return value.replace(/,/g, '');
  };

  return (
    <>
      <InputNumber
        placeholder={'请输入'}
        className={'input-demo sd:w-80'}
        defaultValue={12000}
        min={0}
        formatter={formatter}
        parser={parser}
      />
    </>
  );
}
