import { useState } from 'react';

import { Button } from '../../src/button/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import enUS from '../../src/locale/lang/en-us';
import { PageHeader } from '../../src/page-header/index.js';

export function PageHeaderFixture() {
  const [hidden, setHidden] = useState(false);
  const [events, setEvents] = useState('');
  return (
    <section>
      <Button onClick={() => setHidden(!hidden)}>切换页头区域</Button>
      <ConfigProvider locale={enUS}>
        <PageHeader
          data-testid="page-header"
          title={<strong>页面标题</strong>}
          subtitle={hidden ? undefined : '页面说明'}
          showBack={!hidden}
          breadcrumb={hidden ? undefined : <nav>根目录 / 页面</nav>}
          extra={hidden ? undefined : <Button onClick={() => setEvents('extra')}>页头操作</Button>}
          onBack={(event) => setEvents((value) => value + event.type + ',')}
        >
          {hidden ? undefined : <p>页面正文</p>}
        </PageHeader>
      </ConfigProvider>
      <PageHeader
        data-testid="page-header-custom"
        title="自定义返回"
        backIcon={<span>← 返回</span>}
        onBack={() => setEvents('custom')}
      />
      <output data-testid="page-header-events">{events}</output>
    </section>
  );
}
