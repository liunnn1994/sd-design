import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import { ConfigProvider } from '../../src/config-provider/index.js';
import IconPlus from '../../src/icon/icon-plus.js';
import { Spin } from '../../src/spin/index.js';
import '../../styles/spin.scss';

function SpinFixture() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('provider');
  return (
    <section>
      <button onClick={() => setLoading(!loading)}>切换加载</button>
      <Spin data-testid="delayed-spin" loading={loading} delay={400} tip="加载中">
        <span>保留内容</span>
      </Spin>
      <Spin data-testid="standalone-spin" loading={false} dot size={5} />
      <Spin data-testid="standalone-delayed-spin" delay tip="Delayed indicator" />
      <select
        aria-label="Spin indicator"
        value={mode}
        onChange={(event) => setMode(event.target.value)}
      >
        {['provider', 'dot', 'element', 'icon', 'hidden'].map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <ConfigProvider
        spinProps={{ tip: 'Provider tip', size: 10 }}
        renderLoading={() => <i>Provider indicator</i>}
      >
        <Spin
          data-testid="configured-spin"
          tip="Local tip"
          dot={mode !== 'provider'}
          element={mode === 'element' || mode === 'icon' ? <b>Custom element</b> : undefined}
          icon={mode === 'icon' ? <IconPlus data-testid="custom-spin-icon" /> : undefined}
          hideIcon={mode === 'hidden'}
        />
      </ConfigProvider>
    </section>
  );
}

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SpinFixture />
    </StrictMode>,
  ),
);
