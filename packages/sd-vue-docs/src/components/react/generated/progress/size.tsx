/** @jsxImportSource react */
import { Progress, Radio, RadioGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-[50%]'}>
        <RadioGroup
          value={size}
          onValueChange={(next) => setSize(next as typeof size)}
          type={'button'}
        >
          <Radio value={'small'}>{'小'}</Radio>
          <Radio value={'medium'}>{'中'}</Radio>
          <Radio value={'large'}>{'大'}</Radio>
        </RadioGroup>
        <Progress size={size} percent={0.2} />
        <Progress status={'warning'} size={size} percent={0.2} />
        <Progress status={'danger'} size={size} percent={0.2} />
        <Space>
          <Progress type={'circle'} size={size} percent={0.2} />
          <Progress type={'circle'} status={'warning'} size={size} percent={0.2} />
          <Progress type={'circle'} status={'danger'} size={size} percent={0.2} />
        </Space>
      </Space>
    </>
  );
}
