import { useRef, useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index.js';
import {
  LiquidGlassLogo,
  type LiquidGlassLogoProps,
  type LiquidGlassLogoExposed,
} from '../../src/liquid-glass-logo/index.js';
export function LiquidGlassLogoFixture() {
  const [options, setOptions] = useState<LiquidGlassLogoProps>({
    ending: 'wordmark',
    text: 'SD',
    mark: '',
    height: 64,
    paused: true,
    maxDpr: 1,
    loop: true,
  });
  const [mounted, setMounted] = useState(true);
  const [custom, setCustom] = useState(false);
  const [pageTheme, setPageTheme] = useState<'light' | 'dark'>('light');
  const [libraryTheme, setLibraryTheme] = useState<'dark' | undefined>();
  const [events, setEvents] = useState<string[]>([]);
  const [refStatus, setRefStatus] = useState('');
  const api = useRef<LiquidGlassLogoExposed>(null);
  const patch = (next: LiquidGlassLogoProps) =>
    setOptions((previous) => ({ ...previous, ...next }));
  return (
    <section data-testid="glass-fixture" data-theme={pageTheme} style={{ width: 600 }}>
      <button onClick={() => api.current?.seek(0.5)}>Glass seek</button>
      <button onClick={() => api.current?.replay()}>Glass replay</button>
      <button onClick={() => api.current?.play()}>Glass play</button>
      <button onClick={() => api.current?.pause()}>Glass pause</button>
      <button
        onClick={() => patch({ text: 'Long React 字标', fontSize: 100, letterSpacing: 0.08 })}
      >
        Glass text
      </button>
      <button onClick={() => patch({ autoWidth: options.autoWidth === false })}>
        Glass auto width
      </button>
      <button onClick={() => patch({ height: options.height === 64 ? 20 : 64 })}>
        Glass height
      </button>
      <button onClick={() => patch({ style: { width: 180 } })}>Glass css width</button>
      <button
        onClick={() =>
          patch({
            backgroundImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
            backgroundX: 250,
            backgroundY: -200,
            backgroundScale: 5,
            backgroundTintOpacity: 3,
          })
        }
      >
        Glass background
      </button>
      <button onClick={() => setPageTheme(pageTheme === 'light' ? 'dark' : 'light')}>
        Glass page theme
      </button>
      <button onClick={() => setLibraryTheme(libraryTheme ? undefined : 'dark')}>
        Glass library theme
      </button>
      <button onClick={() => patch({ theme: options.theme === 'light' ? 'auto' : 'light' })}>
        Glass explicit theme
      </button>
      <button onClick={() => patch({ paused: !options.paused })}>Glass paused prop</button>
      <button onClick={() => patch({ ending: options.ending === 'logo' ? 'wordmark' : 'logo' })}>
        Glass ending
      </button>
      <button onClick={() => patch({ logo: 'data:image/png;base64,broken' })}>
        Glass broken image
      </button>
      <button onClick={() => setCustom(!custom)}>Glass custom fallback</button>
      <button onClick={() => setMounted(!mounted)}>Glass mount</button>
      <button onClick={() => setRefStatus(api.current ? 'connected' : 'null')}>Glass ref</button>
      <output data-testid="glass-events">{events.join('|')}</output>
      <output data-testid="glass-ref">{refStatus}</output>
      <ConfigProvider themeMode={libraryTheme}>
        {mounted && (
          <LiquidGlassLogo
            {...options}
            data-testid="glass-main"
            ref={api}
            fallback={custom ? <strong>Static React brand</strong> : undefined}
            onReady={() => setEvents((previous) => [...previous, 'ready'])}
            onError={(error) => setEvents((previous) => [...previous, `error:${error.message}`])}
          />
        )}
      </ConfigProvider>
    </section>
  );
}
