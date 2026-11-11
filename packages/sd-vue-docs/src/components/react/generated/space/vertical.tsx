/** @jsxImportSource react */
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} fill={true}>
        <Button type={'primary'} long={true}>
          {'项目 1'}
        </Button>
        <Button type={'primary'} long={true}>
          {'项目 2'}
        </Button>
        <Button type={'primary'} long={true}>
          {'项目 3'}
        </Button>
      </Space>
    </>
  );
}
