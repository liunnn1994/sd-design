/** @jsxImportSource react */
import { Space, Textarea } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-full'}>
        <Textarea placeholder={'禁用状态'} disabled={true} />
        <Textarea placeholder={'错误状态'} error={true} />
      </Space>
    </>
  );
}
