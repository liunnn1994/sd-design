/** @jsxImportSource react */
import { Input, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Input className={'sd:w-80'} placeholder={'请输入内容'} allowClear={true} />
        <Input
          className={'sd:w-80'}
          defaultValue={'content'}
          placeholder={'请输入内容'}
          allowClear={true}
        />
      </Space>
    </>
  );
}
