/** @jsxImportSource react */
import { Notification } from '@sdata/web-react';
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  const handleNotification = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
    });
  };
  const handleNotificationTopLeft = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
      position: 'topLeft',
    });
  };
  const handleNotificationBottomRight = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
      position: 'bottomRight',
    });
  };
  const handleNotificationBottomLeft = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
      position: 'bottomLeft',
    });
  };

  return (
    <>
      <Space>
        <Button type={'primary'} onClick={handleNotification}>
          {' 右上 '}
        </Button>
        <Button type={'primary'} onClick={handleNotificationTopLeft}>
          {' 左上 '}
        </Button>
        <Button type={'primary'} onClick={handleNotificationBottomRight}>
          {' 右下 '}
        </Button>
        <Button type={'primary'} onClick={handleNotificationBottomLeft}>
          {' 左下 '}
        </Button>
      </Space>
    </>
  );
}
