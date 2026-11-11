/** @jsxImportSource react */
import { Rate, Space } from '@sdata/web-react';

export default function Example() {
  const color = {
    2: 'red',
    4: 'green',
    5: 'blue',
  };

  return (
    <>
      <Space direction={'vertical'}>
        <Rate color={'red'} />
        <Rate color={color} />
      </Space>
    </>
  );
}
