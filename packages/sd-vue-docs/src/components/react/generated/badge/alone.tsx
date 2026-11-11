/** @jsxImportSource react */
import { Badge, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={40}>
        <Badge count={2} />
        <Badge count={2} dotStyle={{ background: '#E5E6EB', color: '#86909C' }} />
        <Badge count={16} />
        <Badge count={1000} maxCount={99} />
      </Space>
    </>
  );
}
