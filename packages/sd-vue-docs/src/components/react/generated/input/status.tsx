/** @jsxImportSource react */
import { Input, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Input className={'sd:w-80'} placeholder={'禁用状态'} disabled={true} />
        <Input
          className={'sd:w-80'}
          defaultValue={'禁用'}
          placeholder={'禁用状态'}
          disabled={true}
        />
        <Input className={'sd:w-80'} placeholder={'错误状态'} error={true} />
      </Space>
    </>
  );
}
