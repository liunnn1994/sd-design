/** @jsxImportSource react */
import { Input, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Input
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          allowClear={true}
          prepend={<>{' +86 '}</>}
        />
        <Input
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          allowClear={true}
          append={<>{' RMB '}</>}
        />
        <Input className={'sd:w-80'} placeholder={'请输入内容'} allowClear={true} prepend={'+86'} />
        <Input className={'sd:w-80'} placeholder={'请输入内容'} allowClear={true} append={'RMB'} />
      </Space>
    </>
  );
}
