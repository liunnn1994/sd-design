/** @jsxImportSource react */
import { Space, Textarea } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'} fill={true}>
        <Textarea
          placeholder={'请输入内容'}
          maxLength={10}
          allowClear={true}
          showWordLimit={true}
        />
        <Textarea
          placeholder={'请输入内容'}
          maxLength={{ length: 10, errorOnly: true }}
          allowClear={true}
          showWordLimit={true}
        />
      </Space>
    </>
  );
}
