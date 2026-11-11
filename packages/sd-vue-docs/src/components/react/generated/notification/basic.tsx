/** @jsxImportSource react */
import { Notification } from '@sdata/web-react';
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  const handleNotification = () => {
    Notification.info({
      title: '通知',
      content: '这是一条通知！',
    });
  };

  return (
    <>
      <Space>
        <Button type={'primary'} onClick={handleNotification}>
          {' 打开通知 '}
        </Button>
        <Button onClick={handleNotification}>{' 打开通知 '}</Button>
      </Space>
    </>
  );
}
