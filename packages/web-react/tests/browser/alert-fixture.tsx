import { useState } from 'react';

import { Alert } from '../../src/alert/index.js';
import { Button } from '../../src/button/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import enUS from '../../src/locale/lang/en-us';

export function AlertFixture() {
  const [events, setEvents] = useState('');
  const [mounted, setMounted] = useState(true);
  const [compact, setCompact] = useState(false);
  return (
    <section>
      <Button onClick={() => setCompact(!compact)}>切换通知布局</Button>
      <Alert
        data-testid="alert-basic"
        type={compact ? 'normal' : 'info'}
        title={compact ? undefined : '通知标题'}
        closable={!compact}
        onClose={(event) => setEvents((value) => value + event.type + ',')}
        onAfterClose={() => setEvents((value) => value + 'after,')}
      >
        通知内容
      </Alert>
      <output data-testid="alert-events">{events}</output>
      <Alert
        data-testid="alert-banner"
        type={compact ? 'success' : 'warning'}
        banner={!compact}
        center={!compact}
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
