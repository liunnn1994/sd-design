import { useState } from 'react';

import { Copy, Secret, ConfigProvider } from '../../src/index';
import enUS from '../../src/locale/lang/en-us';
import zhCN from '../../src/locale/lang/zh-cn';

export function CopySecretFixture() {
  const [mounted, setMounted] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const [english, setEnglish] = useState(true);
  const [visible, setVisible] = useState(false);
  return (
    <ConfigProvider locale={english ? enUS : zhCN}>
      <section data-testid="copy-secret">
        <button onClick={() => setMounted(!mounted)}>Toggle copy mount</button>
        <button onClick={() => setEnglish(!english)}>Toggle copy language</button>
        <button onClick={() => setVisible(!visible)}>Control secret</button>
        {mounted && (
          <Copy
            data-testid="copy-link"
            content="test-copy-content"
            onCopy={(text) => setEvents((values) => [...values, text])}
          />
        )}
        <Copy
          data-testid="copy-button"
          component="button"
          type="primary"
          content="button-content"
          successMessage="Custom success"
          tooltip="Custom tooltip"
        >
          Copy button
        </Copy>
        <Copy data-testid="copy-disabled" content="disabled" disabled />
        <Copy data-testid="copy-empty" />
        <Copy
          data-testid="copy-custom"
          content="custom"
          icon={<b>Custom icon</b>}
          textInherit={false}
          tooltipProps={{ content: 'Override tooltip' }}
        />
        <output data-testid="copy-events">{JSON.stringify(events)}</output>
        <Secret data-testid="secret-default" text="demo-sensitive-content" />
        <Secret
          data-testid="secret-controlled"
          text="controlled-content"
          hiddenText="Hidden"
          showCopy={false}
          visible={visible}
          onVisibleChange={(value) => setEvents((values) => [...values, String(value)])}
        />
      </section>
    </ConfigProvider>
  );
}
