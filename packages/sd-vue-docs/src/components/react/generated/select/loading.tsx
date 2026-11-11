/** @jsxImportSource react */
import { Select } from '@sdata/web-react';

export default function Example() {
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];

  return (
    <>
      <Select className={'sd:w-80'} placeholder={'请选择…'} loading={true} options={options} />
    </>
  );
}
