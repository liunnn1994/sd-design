/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button, Notification, Space } from '@sdata/web-react';

export default function Example() {
  interface MessageApi {
    info: (config: { content: string; position?: 'top' | 'bottom' }) => void;
  }
  type MessageProxy = {
    Message?: MessageApi;
  };
  const instance = {
    proxy: { $message: Message, $notification: Notification },
    appContext: undefined,
  };
  const proxy = instance?.proxy as MessageProxy | undefined;
  const showTopMessage = () => {
    proxy?.Message?.info({ content: '这是一条提示消息！' });
  };
  const showBottomMessage = () => {
    proxy?.Message?.info({
      content: '这是一条提示消息！',
      position: 'bottom',
    });
  };

  return (
    <>
      <Space>
        <Button onClick={showTopMessage}>{'顶部消息'}</Button>
        <Button onClick={showBottomMessage}>{'底部消息'}</Button>
      </Space>
    </>
  );
}
