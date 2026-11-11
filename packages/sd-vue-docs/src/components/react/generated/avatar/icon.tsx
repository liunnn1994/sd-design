/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Avatar, Space } from '@sdata/web-react';
import { IconCamera, IconEdit, IconUser } from '@sdata/web-react/icon';

export default function Example() {
  function toast() {
    Message.info('上传中…');
  }

  return (
    <>
      <Space size={'large'}>
        <Avatar
          triggerIconStyle={{ color: '#3491FA' }}
          autoFixFontSize={false}
          onClick={toast}
          className={'sd:bg-[#168cff]'}
          triggerIcon={
            <>
              <IconCamera />
            </>
          }
        >
          {' A '}
        </Avatar>
        <Avatar
          onClick={toast}
          className={'sd:bg-[#14c9c9]'}
          triggerIcon={
            <>
              <IconEdit />
            </>
          }
        >
          <IconUser />
        </Avatar>
        <Avatar
          onClick={toast}
          shape={'square'}
          className={'sd:bg-[#ffc72e]'}
          triggerIcon={
            <>
              <IconEdit />
            </>
          }
        >
          <IconUser />
        </Avatar>
        <Avatar
          triggerType={'mask'}
          triggerIcon={
            <>
              <IconEdit />
            </>
          }
        >
          <img alt={'头像'} src={'https://picsum.photos/1000/1000'} />
        </Avatar>
      </Space>
    </>
  );
}
