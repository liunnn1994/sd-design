/** @jsxImportSource react */
import { InputSearch, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputSearch className={'sd:w-80'} placeholder={'请输入内容'} />
        <InputSearch className={'sd:w-80'} placeholder={'请输入内容'} searchButton={true} />
      </Space>
    </>
  );
}
