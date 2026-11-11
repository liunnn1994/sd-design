/** @jsxImportSource react */
import { Badge, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'} direction={'vertical'}>
        <Space size={'large'}>
          <Badge status={'normal'} />
          <Badge status={'processing'} />
          <Badge status={'success'} />
          <Badge status={'warning'} />
          <Badge status={'danger'} />
        </Space>
        <Space size={'large'}>
          <Badge status={'normal'} text={'常规'} />
          <Badge status={'processing'} text={'处理中'} />
          <Badge status={'success'} text={'成功'} />
          <Badge status={'warning'} text={'警告'} />
          <Badge status={'danger'} text={'危险'} />
        </Space>
      </Space>
    </>
  );
}
