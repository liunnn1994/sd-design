/** @jsxImportSource react */
import { Input, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'} fill={true}>
        <Input
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          maxLength={10}
          allowClear={true}
          showWordLimit={true}
        />
        <Input
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          maxLength={{ length: 10, errorOnly: true }}
          allowClear={true}
          showWordLimit={true}
        />
      </Space>
    </>
  );
}
