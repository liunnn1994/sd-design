import { Avatar, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconUser } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Avatar>{'A'}</Avatar>
        <Avatar className={'sd:bg-[#3370ff]'}>
          <IconUser />
        </Avatar>
        <Avatar className={'sd:bg-[#14a9f8]'}>{'SD'}</Avatar>
        <Avatar className={'sd:bg-[#00d0b6]'}>{'设计'}</Avatar>
        <Avatar>
          <img alt={'头像'} src={'https://picsum.photos/1000/1000'} />
        </Avatar>
      </Space>
    </>
  );
}
