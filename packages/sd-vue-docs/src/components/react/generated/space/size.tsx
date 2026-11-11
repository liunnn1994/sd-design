/** @jsxImportSource react */
import { Button, Radio, RadioGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<'mini' | 'small' | 'medium' | 'large'>('medium');

  return (
    <>
      <div>
        <div className={'sd:mb-5'}>
          <RadioGroup
            value={size}
            onValueChange={(next) => setSize(next as typeof size)}
            type={'button'}
          >
            <Radio value={'mini'}>{'迷你'}</Radio>
            <Radio value={'small'}>{'小'}</Radio>
            <Radio value={'medium'}>{'中'}</Radio>
            <Radio value={'large'}>{'大'}</Radio>
          </RadioGroup>
        </div>
        <Space size={size}>
          <Button type={'primary'}>{'项目 1'}</Button>
          <Button type={'primary'}>{'项目 2'}</Button>
          <Button type={'primary'}>{'项目 3'}</Button>
        </Space>
      </div>
    </>
  );
}
