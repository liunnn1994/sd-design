/** @jsxImportSource react */
import { Avatar, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Avatar imageUrl={'https://picsum.photos/1000/1000'} />
        {' 加载失败: '}
        <Avatar imageUrl={'https://foo.bar.com/non-existent-avatar.png'} />
      </Space>
    </>
  );
}
