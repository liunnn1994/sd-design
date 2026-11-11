/** @jsxImportSource react */
import { Select } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('bj');
  const fieldNames = { value: 'city', label: 'text' };
  const [options, setOptions] = useState([
    {
      city: 'bj',
      text: '北京',
    },
    {
      city: 'sh',
      text: '上海',
    },
    {
      city: 'gz',
      text: '广州',
    },
    {
      city: 'cd',
      text: '成都',
    },
  ]);

  return (
    <>
      <Select
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        options={options}
        fieldNames={fieldNames}
        className={'sd:w-80'}
        placeholder={'请选择…'}
      />
    </>
  );
}
