import { useState } from 'react';

import { BackTop, ConfigProvider } from '../../src/index';
import enUS from '../../src/locale/lang/en-us';

export function BackTopFixture() {
  const [mounted, setMounted] = useState(false);
  const [second, setSecond] = useState(false);
  const [threshold, setThreshold] = useState(200);
  const [duration, setDuration] = useState(200);
  const [custom, setCustom] = useState(false);
  const [clicks, setClicks] = useState(0);
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount BackTop' : 'Mount BackTop'}
      </button>
      <button onClick={() => setSecond(!second)}>Switch BackTop target</button>
      <button onClick={() => setThreshold(threshold === 200 ? 400 : 200)}>
        Change BackTop threshold
      </button>
      <button onClick={() => setDuration(0)}>Instant BackTop</button>
      <button onClick={() => setCustom(!custom)}>Custom BackTop</button>
      <output data-testid="back-top-clicks">{clicks}</output>
      <div id="back-top-first" style={{ height: 120, overflow: 'auto' }}>
        <div style={{ height: 800 }}>First scroll target</div>
      </div>
      <div id="back-top-second" style={{ height: 120, overflow: 'auto' }}>
        <div style={{ height: 800 }}>Second scroll target</div>
      </div>
      {mounted && (
        <ConfigProvider locale={enUS}>
          <BackTop
            data-testid="back-top"
            targetContainer={second ? '#back-top-second' : '#back-top-first'}
            visibleHeight={threshold}
            duration={duration}
            onClick={() => setClicks((value) => value + 1)}
          >
            {custom ? <button>Custom return</button> : undefined}
          </BackTop>
        </ConfigProvider>
      )}
    </section>
  );
}
