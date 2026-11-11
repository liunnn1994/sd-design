/** @jsxImportSource react */
import { Message, Notification } from '@sdata/web-react';
import { Button, ConfigProvider, Space } from '@sdata/web-react';

export default function Example() {
  const context = {
    proxy: { $message: Message, $notification: Notification },
    appContext: undefined,
  }!.appContext;
  const showMessage = (deduplicate?: boolean) =>
    Message.success({ content: '保存成功', deduplicate });
  const showNotification = (deduplicate?: boolean) =>
    Notification.success({ title: '保存结果', content: '保存成功', deduplicate });

  return (
    <>
      <ConfigProvider
        global={true}
        message={{ deduplicate: true }}
        notification={{ deduplicate: true }}
      >
        <Space wrap={true}>
          <Button
            onClick={() => {
              showMessage();
            }}
          >
            {'去重消息'}
          </Button>
          <Button
            onClick={() => {
              showMessage(false);
            }}
          >
            {'重复消息'}
          </Button>
          <Button
            onClick={() => {
              showNotification();
            }}
          >
            {'去重通知'}
          </Button>
          <Button
            onClick={() => {
              showNotification(false);
            }}
          >
            {'重复通知'}
          </Button>
        </Space>
      </ConfigProvider>
    </>
  );
}
