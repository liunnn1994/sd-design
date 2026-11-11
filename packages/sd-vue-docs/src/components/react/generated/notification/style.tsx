/** @jsxImportSource react */
import { Notification } from '@sdata/web-react';
import { Button } from '@sdata/web-react';

export default function Example() {
  const handleNotification = () => {
    Notification.info({
      title: '通知',
      content: '这是一条通知！',
      closable: true,
      style: { width: '500px' },
    });
  };

  return (
    <>
      <Button type={'primary'} onClick={handleNotification}>
        {' 打开通知 '}
      </Button>
    </>
  );
}
