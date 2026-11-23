import { createContext, useContext, useLayoutEffect, useState } from 'react';

import type { MessageMethod } from '../../src/message/index.js';
import type { NotificationMethod } from '../../src/notification/index.js';

import { ConfigProvider } from '../../src/config-provider/index.js';
import enUS from '../../src/locale/lang/en-us';
import zhCN from '../../src/locale/lang/zh-cn';
import { Message, useMessage } from '../../src/message/index.js';
import { Notification, useNotification } from '../../src/notification/index.js';

const LabelContext = createContext('Missing context');
const api: {
  message: MessageMethod;
  notification: NotificationMethod;
  hookMessage?: MessageMethod;
  hookNotification?: NotificationMethod;
} = { message: Message, notification: Notification };
function Label() {
  return <strong>{useContext(LabelContext)}</strong>;
}
function HookNotices() {
  const [message, messageHolder] = useMessage();
  const [notification, notificationHolder] = useNotification();
  useLayoutEffect(() => {
    api.hookMessage = message;
    api.hookNotification = notification;
    return () => {
      delete api.hookMessage;
      delete api.hookNotification;
    };
  }, [message, notification]);
  return (
    <>
      {messageHolder}
      {notificationHolder}
      <button onClick={() => message.success({ content: <Label />, duration: 0, closable: true })}>
        Hook context message
      </button>
      <button
        onClick={() =>
          notification.info({
            title: 'Custom title',
            content: <Label />,
            icon: <b>Custom icon</b>,
            footer: <button onClick={() => notification.clear()}>Footer clear</button>,
            closeIconElement: <b>Custom close</b>,
            closable: true,
            duration: 0,
            className: 'custom-notice',
            style: { width: 350 },
          })
        }
      >
        Hook context notification
      </button>
    </>
  );
}
function EffectNotices() {
  const [message, holder] = useMessage();
  useLayoutEffect(() => {
    message.info({ content: 'Effect notice', duration: 0 });
    message.info({ content: 'Effect notice', duration: 0 });
  }, [message]);
  return <ConfigProvider message={{ deduplicate: true }}>{holder}</ConfigProvider>;
}
export function NoticeFixture() {
  const [mounted, setMounted] = useState(true);
  const [effectMounted, setEffectMounted] = useState(false);
  const [english, setEnglish] = useState(true);
  useLayoutEffect(() => {
    Object.assign(window, { noticeFixture: api });
    return () => {
      Message.clear();
      Notification.clear();
      Reflect.deleteProperty(window, 'noticeFixture');
    };
  }, []);
  return (
    <section>
      <button onClick={() => setEffectMounted(!effectMounted)}>Toggle effect notices</button>
      {effectMounted && <EffectNotices />}
      <button onClick={() => setMounted(!mounted)}>Toggle notice hooks</button>
      <button onClick={() => setEnglish(!english)}>Toggle notice language</button>
      <ConfigProvider
        locale={english ? enUS : zhCN}
        themeMode="dark"
        theme={{ tokens: { 'color-primary-6': '#d03050' } }}
        message={{ deduplicate: true }}
        notification={{ deduplicate: true }}
      >
        <LabelContext.Provider value="Inherited context">
          {mounted && <HookNotices />}
        </LabelContext.Provider>
      </ConfigProvider>
    </section>
  );
}
