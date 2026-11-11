/** @jsxImportSource react */
import { Space, Spin } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Spin />
        <Spin size={28} />
        <Spin size={32} />
      </Space>
    </>
  );
}
