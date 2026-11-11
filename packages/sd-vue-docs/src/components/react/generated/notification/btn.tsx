/** @jsxImportSource react */
import { Button, Notification, Space } from '@sdata/web-react';
import { createElement } from 'react';

export default function Example() {
  function handleNotification() {
    const id = `${Date.now()}`;
    const closeNotification = Notification.info({
      id,
      title: '通知',
      content: '这是一条通知！',
      duration: 0,
      footer: () =>
        createElement(
          Space,
          null,
          (() => [
            createElement(
              Button,
              { type: 'secondary', size: 'small', onClick: () => Notification.remove(id) },
              (() => '取消')(),
            ),
            createElement(
              Button,
              { type: 'primary', size: 'small', onClick: () => closeNotification.close() },
              (() => '确认')(),
            ),
          ])(),
        ),
    });
  }

  return (
    <>
      <Button type={'primary'} onClick={handleNotification}>
        {' 打开通知 '}
      </Button>
    </>
  );
}
