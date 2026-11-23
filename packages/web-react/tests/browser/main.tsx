import React, { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { Button } from '../../src/button/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import '../../styles/button.scss';
import '../../styles/config-provider.scss';
function App() {
  const providerAttrs = new URLSearchParams(location.search).has('provider-attrs');
  const [clicks, setClicks] = useState(0);
  const [themeVisible, setThemeVisible] = useState(true);
  const [dark, setDark] = useState(false);
  const [globalTheme, setGlobalTheme] = useState(false);
  return (
    <>
      <output data-testid="clicks">{clicks}</output>
      <Button onClick={() => setDark(!dark)}>切换局部主题</Button>
      <Button onClick={() => setThemeVisible(!themeVisible)}>卸载局部主题</Button>
      <section data-testid="local-theme">
        {themeVisible && (
          <ConfigProvider
            themeMode={dark ? 'dark' : 'light'}
            theme={{ tokens: { 'color-primary-6': '#123456' } }}
            {...(providerAttrs
              ? {
                  'id': 'provider-attrs',
                  'className': dark ? 'provider-dark' : 'provider-light',
                  'style': { padding: dark ? 8 : 4 },
                  'data-provider': dark ? 'dark' : 'light',
                  'aria-label': 'Provider attributes',
                  'onClick': () => setClicks((count) => count + 1),
                }
              : {})}
          >
            <Button>主题按钮</Button>
          </ConfigProvider>
        )}
      </section>
      <Button onClick={() => setGlobalTheme(!globalTheme)}>切换全局主题</Button>
      {globalTheme && <ConfigProvider global themeMode="dark" />}
      <section data-testid="inherited-theme">
        <ConfigProvider theme={{ tokens: { 'color-primary-6': '#654321' } }}>
          <Button>继承环境主题</Button>
        </ConfigProvider>
      </section>
    </>
  );
}

// Finish mounting before the page load event, even when React's scheduler is delayed.
flushSync(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
