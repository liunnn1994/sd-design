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
      <div className={'sd:mt-5 sd:grid sd:gap-6'}>
        <Descriptions data={data} size={size} title={'用户信息（水平）'} bordered={true} />
        <Descriptions
          data={data}
          size={size}
          title={'用户信息（行内水平）'}
          layout={'inline-horizontal'}
          bordered={true}
        />
        <Descriptions
          data={data}
          size={size}
          title={'用户信息（垂直）'}
          layout={'vertical'}
          bordered={true}
        />
        <Descriptions
          data={data}
          size={size}
          title={'用户信息（行内垂直）'}
          layout={'inline-vertical'}
          bordered={true}
        />
      </div>
    </>
  );
}
