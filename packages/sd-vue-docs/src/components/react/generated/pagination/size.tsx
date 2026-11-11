/** @jsxImportSource react */
import { Pagination, Radio, RadioGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<'mini' | 'small' | 'medium' | 'large'>('medium');

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
        <Pagination total={50} size={size} showTotal={true} showJumper={true} showPageSize={true} />
      </Space>
    </>
  );
}
