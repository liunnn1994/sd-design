/** @jsxImportSource react */
import { Avatar, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'} direction={'vertical'}>
        <Space size={'large'}>
          <Avatar size={64}>{'SD'}</Avatar>
          <Avatar size={40}>{'SD'}</Avatar>
          <Avatar size={32}>{'SD'}</Avatar>
          <Avatar size={24}>{'SD'}</Avatar>
        </Space>
        <Space size={'large'}>
          <Avatar size={64} shape={'square'}>
            {'SD'}
          </Avatar>
          <Avatar size={40} shape={'square'}>
            {'SD'}
          </Avatar>
          <Avatar size={32} shape={'square'}>
            {'SD'}
          </Avatar>
          <Avatar size={24} shape={'square'}>
            {'SD'}
          </Avatar>
        </Space>
      </Space>
    </>
  );
}
