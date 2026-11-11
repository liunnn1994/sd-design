/** @jsxImportSource react */
import { Avatar, AvatarGroup, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={32}>
        <AvatarGroup>
          <Avatar className={'sd:bg-[#7bc616]'}>{'A'}</Avatar>
          <Avatar className={'sd:bg-[#14c9c9]'}>{'B'}</Avatar>
          <Avatar className={'sd:bg-[#168cff]'}>{'C'}</Avatar>
          <Avatar className={'sd:bg-[#ff7d00]'}>{'SD'}</Avatar>
          <Avatar className={'sd:bg-[#ffc72e]'}>{'设计'}</Avatar>
        </AvatarGroup>
        <AvatarGroup size={24}>
          <Avatar className={'sd:bg-[#7bc616]'}>{'A'}</Avatar>
          <Avatar className={'sd:bg-[#14c9c9]'}>{'B'}</Avatar>
          <Avatar className={'sd:bg-[#168cff]'}>{'C'}</Avatar>
          <Avatar className={'sd:bg-[#ff7d00]'}>{'SD'}</Avatar>
          <Avatar className={'sd:bg-[#ffc72e]'}>{'设计'}</Avatar>
        </AvatarGroup>
        <AvatarGroup size={24} maxCount={3}>
          <Avatar className={'sd:bg-[#7bc616]'}>{'A'}</Avatar>
          <Avatar className={'sd:bg-[#14c9c9]'}>{'B'}</Avatar>
          <Avatar className={'sd:bg-[#168cff]'}>{'C'}</Avatar>
          <Avatar className={'sd:bg-[#ff7d00]'}>{'SD'}</Avatar>
          <Avatar className={'sd:bg-[#ffc72e]'}>{'设计'}</Avatar>
        </AvatarGroup>
      </Space>
    </>
  );
}
