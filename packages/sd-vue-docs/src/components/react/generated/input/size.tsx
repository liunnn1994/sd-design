/** @jsxImportSource react */
import type { Size } from '@sdata/web-react';

import { Input, Radio, RadioGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<Size>('medium');

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
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
        <Input className={'sd:w-80'} placeholder={'请输入内容'} size={size} allowClear={true} />
      </Space>
    </>
  );
}
