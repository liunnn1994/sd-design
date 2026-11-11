/** @jsxImportSource react */
import { Button, Notification } from '@sdata/web-react';
import { Space } from '@sdata/web-react';
import { IconCloseCircle } from '@sdata/web-react/icon';
import { createElement } from 'react';

export default function Example() {
  function handleNotification() {
    Notification.info({
      title: '通知',
      content: '这是一条通知！',
      closable: true,
      closeIcon: () => createElement(IconCloseCircle, null),
    });
  }
  function handleNotification2() {
    Notification.error({
      title: '通知',
      content: '这是一条通知！',
      closable: true,
      closeIconElement: () => createElement(Button, { size: 'mini' }, (() => '关闭')()),
    });
  }

  return (
    <>
      <Space>
        <Button type={'primary'} onClick={handleNotification}>
          {' 打开通知 '}
        </Button>
        <Button type={'primary'} status={'danger'} onClick={handleNotification2}>
          {' 打开通知 '}
        </Button>
      </Space>
    </>
  );
}
