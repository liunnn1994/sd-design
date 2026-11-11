/** @jsxImportSource react */
import { Select } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('上海');
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];

  return (
    <>
      <Select
        className={'sd:w-80'}
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        placeholder={'请选择…'}
        allowClear={true}
        options={options}
      />
    </>
  );
}
