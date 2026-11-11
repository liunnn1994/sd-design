import { useState } from 'react';

import { Alert, Button, ConfigProvider } from '../../src/index';
import enUS from '../../src/locale/lang/en-us';

export function AlertFixture() {
  const [events, setEvents] = useState('');
  const [mounted, setMounted] = useState(true);
  return (
    <section>
      <Alert
        data-testid="alert-basic"
        title="通知标题"
        closable
        onClose={(event) => setEvents((value) => value + event.type + ',')}
        onAfterClose={() => setEvents((value) => value + 'after,')}
      >
        通知内容
      </Alert>
      <output data-testid="alert-events">{events}</output>
      <Alert
        data-testid="alert-banner"
        type="warning"
        banner
        center
        action={<Button onClick={() => setEvents('action')}>通知操作</Button>}
      >
        横幅内容
      </Alert>
      <Alert data-testid="alert-normal" type="normal">
        普通通知
      </Alert>
      <Alert
        data-testid="alert-custom"
        type="normal"
        icon={<span>自定义图标</span>}
        title={<strong>自定义标题</strong>}
        closable
        closeElement="隐藏通知"
      >
        自定义内容
      </Alert>
      <Alert data-testid="alert-no-icon" type="error" showIcon={false}>
        无图标
      </Alert>
      <ConfigProvider locale={enUS}>
        <Alert data-testid="alert-en" type="success" closable>
          English alert
        </Alert>
      </ConfigProvider>
      {mounted && (
        <Alert
          data-testid="alert-unmount"
          closable
          onClose={() => setMounted(false)}
          onAfterClose={() => setEvents('unexpected')}
        >
          卸载时取消动画
        </Alert>
      )}
    </section>
  );
}
