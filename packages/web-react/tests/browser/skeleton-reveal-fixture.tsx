import { useRef, useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index';
import { SkeletonReveal, type SkeletonRevealExposed } from '../../src/skeleton-reveal/index';
export function SkeletonRevealFixture() {
  const ref = useRef<SkeletonRevealExposed>(null);
  const second = useRef<SkeletonRevealExposed>(null);
  const [duration, setDuration] = useState(8000);
  const [disabled, setDisabled] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [finishes, setFinishes] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [width, setWidth] = useState(360);
  const [many, setMany] = useState(false);
  const [theme, setTheme] = useState(false);
  return (
    <section data-testid="reveal-fixture">
      <button
        onClick={() => {
          void ref.current?.replay();
        }}
      >
        Reveal replay
      </button>
      <button
        onClick={() => {
          void ref.current?.replay();
          void ref.current?.replay();
        }}
      >
        Reveal twice
      </button>
      <button onClick={() => ref.current?.finish()}>Reveal finish</button>
      <button onClick={() => setDuration(600)}>Reveal short</button>
      <button onClick={() => setDuration(8000)}>Reveal long</button>
      <button onClick={() => setDuration(0)}>Reveal zero</button>
      <button onClick={() => setDisabled(!disabled)}>Reveal disabled</button>
      <button onClick={() => setMounted(!mounted)}>Reveal mount</button>
      <button onClick={() => setWidth(260)}>Reveal resize</button>
      <button onClick={() => setMany(!many)}>Reveal many</button>
      <button onClick={() => setTheme(!theme)}>Reveal theme</button>
      <button
        onClick={() => {
          void second.current?.replay();
        }}
      >
        Reveal second
      </button>
      <output data-testid="reveal-finish-count">{finishes}</output>
      <output data-testid="reveal-click-count">{clicks}</output>
      <ConfigProvider
        theme={{
          components: {
            'skeleton-reveal': theme
              ? { stroke: '#00aa66', strokeWidth: '2px' }
              : { 'skeleton-reveal-stroke': '#123456', 'skeleton-reveal-stroke-width': '8px' },
          },
        }}
      >
        {mounted && (
          <SkeletonReveal
            data-testid="reveal-main"
            ref={ref}
            autoplay={false}
            disabled={disabled}
            duration={duration}
            style={{ width }}
            onFinish={() => setFinishes((value) => value + 1)}
          >
            {many ? (
              Array.from({ length: 100 }, (_, index) => <p key={index}>Row {index}</p>)
            ) : (
              <form style={{ padding: 24, border: '1px solid' }}>
                <p>Create project</p>
                <input aria-label="Reveal draft" />
                <button type="button" onClick={() => setClicks((value) => value + 1)}>
                  Reveal create
                </button>
              </form>
            )}
          </SkeletonReveal>
        )}
      </ConfigProvider>
      <SkeletonReveal data-testid="reveal-second" ref={second} autoplay={false} duration={8000}>
        <p>Second content</p>
      </SkeletonReveal>
      <div style={{ height: 1600 }} />
      <SkeletonReveal data-testid="reveal-auto" duration={600}>
        <button>Reveal autoplay content</button>
      </SkeletonReveal>
    </section>
  );
}
