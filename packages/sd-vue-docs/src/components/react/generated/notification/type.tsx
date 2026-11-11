/** @jsxImportSource react */
import { Notification } from '@sdata/web-react';
import { Button, Message, Space } from '@sdata/web-react';

export default function Example() {
  interface NotificationApi {
    info: (config: string | { content: string; showIcon?: boolean }) => void;
    success: (content: string) => void;
    warning: (content: string) => void;
    error: (content: string) => void;
  }
  type NotificationProxy = {
    Notification?: NotificationApi;
  };
  const instance = {
    proxy: { $message: Message, $notification: Notification },
    appContext: undefined,
  };
  const proxy = instance?.proxy as NotificationProxy | undefined;
  const showInfo = () => proxy?.Notification?.info('这是一条提示消息！');
  const showSuccess = () => proxy?.Notification?.success('操作成功！');
  const showWarning = () => proxy?.Notification?.warning('请注意检查操作内容！');
  const showError = () => proxy?.Notification?.error('这是一条错误消息！');
  const showNormal = () =>
    proxy?.Notification?.info({
      content: '这是一条错误消息！',
      showIcon: false,
    });

  return (
    <>
      <Space>
        <Button type={'primary'} onClick={showInfo}>
          {' 信息 '}
        </Button>
        <Button type={'primary'} status={'success'} onClick={showSuccess}>
          {' 成功 '}
        </Button>
        <Button type={'primary'} status={'warning'} onClick={showWarning}>
          {' 警告 '}
        </Button>
        <Button type={'primary'} status={'danger'} onClick={showError}>
          {' 错误 '}
        </Button>
        <Button type={'secondary'} onClick={showNormal}>
          {' 常规 '}
        </Button>
      </Space>
    </>
  );
}
