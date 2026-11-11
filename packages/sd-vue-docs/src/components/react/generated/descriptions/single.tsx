/** @jsxImportSource react */
import type { DescData, Size } from '@sdata/web-react';

import { Descriptions, Radio, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<Size>('medium');
  const data: DescData[] = [
    {
      label: '姓名',
      value: '苏格拉底',
    },
    {
      label: '手机',
      value: '123-1234-1234',
    },
    {
      label: '居住地',
      value: '北京',
    },
    {
      label: '家乡',
      value: '北京',
    },
    {
      label: '地址',
      value: '北京市知春路示例大厦',
    },
  ];

  return (
    <>
      <RadioGroup
        type={'button'}
        value={size}
        onValueChange={(next) => setSize(next as typeof size)}
      >
        <Radio value={'mini'}>{'迷你'}</Radio>
        <Radio value={'small'}>{'小'}</Radio>
        <Radio value={'medium'}>{'中'}</Radio>
        <Radio value={'large'}>{'大'}</Radio>
      </RadioGroup>
      <Descriptions className={'sd:mt-5'} data={data} size={size} title={'用户信息'} column={1} />
    </>
  );
}
