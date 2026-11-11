/** @jsxImportSource react */
import type { Size } from '@sdata/web-react';

import { Radio, RadioGroup, Select, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<Size>('medium');
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
  const allOptions = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];

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
        <Select
          defaultValue={'北京'}
          className={'sd:w-80'}
          size={size}
          placeholder={'请选择…'}
          options={options}
        />
        <Select
          defaultValue={['北京', '上海']}
          className={'sd:w-80'}
          size={size}
          placeholder={'请选择…'}
          multiple={true}
          options={allOptions}
        />
      </Space>
    </>
  );
}
