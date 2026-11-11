/** @jsxImportSource react */
import { Notification } from '@sdata/web-react';
import { Button } from '@sdata/web-react';

export default function Example() {
  const handleNotification = () => {
    Notification.warning({
      id: 'your_id',
      title: '准备更新',
      content: '将在 2 秒后更新…',
      duration: 0,
    });

    setTimeout(() => {
      Notification.success({
        id: 'your_id',
        title: '成功',
        content: '更新成功！',
        duration: 3000,
      });
    }, 2000);
  };

  return (
    <>
      <Button type={'primary'} onClick={handleNotification}>
        {' 打开通知 '}
      </Button>
    </>
  );
}
