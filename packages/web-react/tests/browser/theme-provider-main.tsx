import { ConfigProvider } from '@sdata/web-react';
import { ThemeProvider } from '@sdata/web-react/theme-provider';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '../../styles/theme-provider.scss';

const query = new URLSearchParams(location.search);
const overlap = query.has('overlap');
if (overlap) {
  document.body.setAttribute('sd-theme', 'light');
  document.body.style.setProperty('--color-primary-6', '#112233', 'important');
}

function Fixture() {
  const [mounted, setMounted] = useState(true);
  const [secondMounted, setSecondMounted] = useState(overlap);
  const [alternate, setAlternate] = useState(false);
  const [dark, setDark] = useState(overlap);
  const [token, setToken] = useState(true);
  const plain = query.has('plain');
  const inherited = query.has('inherited');
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Mount</button>
      <button onClick={() => setAlternate(!alternate)}>Tag</button>
      <button onClick={() => setDark(!dark)}>Mode</button>
      <button onClick={() => setToken(!token)}>Tokens</button>
      {overlap && <button onClick={() => setSecondMounted(false)}>Remove second</button>}
      <ConfigProvider prefixCls={query.has('prefix') ? 'custom' : undefined}>
        {mounted && (
          <ThemeProvider
            tag={alternate ? 'article' : 'section'}
            id="theme-root"
            className="extra"
            aria-label="Themed area"
            style={{ padding: 12 }}
            global={query.has('global')}
            themeMode={plain || inherited ? undefined : dark ? 'dark' : 'light'}
            theme={
              plain
                ? undefined
                : {
                    tokens: token
                      ? { colorPrimary6: '#123456', colorText2: '#234567' }
                      : { colorPrimary6: '#abcdef' },
                  }
            }
          >
            <span data-testid="content">Content</span>
            {query.has('nested') && (
              <ThemeProvider theme={{ tokens: { colorText1: '#345678' } }}>
                <span>Nested</span>
              </ThemeProvider>
            )}
          </ThemeProvider>
        )}
        {secondMounted && (
          <ThemeProvider global themeMode="light" theme={{ tokens: { colorPrimary6: '#445566' } }}>
            <span>Second global provider</span>
          </ThemeProvider>
        )}
      </ConfigProvider>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
