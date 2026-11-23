import { useRef, useState } from 'react';

import type { ScrollbarExposed } from '../../src/scrollbar/index';

import { Scrollbar } from '../../src/scrollbar/index';

export function ScrollbarFixture() {
  const ref = useRef<ScrollbarExposed>(null);
  const [items, setItems] = useState(10);
  const [scrolls, setScrolls] = useState(0);
  const [track, setTrack] = useState(false);
  const [state, setState] = useState('');
  const auto = useRef<ScrollbarExposed>(null);
  const lastInstance = useRef<ReturnType<ScrollbarExposed['getOSInstance']>>(null);
  const [autoMounted, setAutoMounted] = useState(false);
  const [limit, setLimit] = useState(100);
  const [explicitHeight, setExplicitHeight] = useState(false);
  const [destroyed, setDestroyed] = useState(false);
  return (
    <section>
      <Scrollbar
        ref={ref}
        data-testid="scrollbar"
        type={track ? 'track' : 'embed'}
        disableHorizontal={track}
        overlayOptions={{ overflow: { y: 'hidden' } }}
        overflow={{ y: 'scroll' }}
        outerStyle={{ width: 240, height: 100 }}
        onScroll={() => setScrolls((n) => n + 1)}
      >
        {Array.from({ length: items }, (_, i) => (
          <p key={i} style={{ height: 30 }}>
            滚动内容 {i}
          </p>
        ))}
      </Scrollbar>
      <button onClick={() => ref.current?.scrollTop(80)}>滚动到 80</button>
      <button onClick={() => setItems((n) => (n === 10 ? 2 : 10))}>改变滚动内容</button>
      <button onClick={() => setTrack(!track)}>切换滚动条类型</button>
      <button
        onClick={() => {
          const scrollbar = ref.current;
          const options = scrollbar?.options();
          setState(
            JSON.stringify({
              x: options?.overflow.x,
              y: options?.overflow.y,
              theme: options?.scrollbars.theme,
              viewport:
                scrollbar?.elements()?.viewport.dataset.overlayscrollbarsViewport !== undefined,
              instance: scrollbar?.state()?.destroyed === false,
            }),
          );
        }}
      >
        Inspect scrollbar
      </button>
      <output data-testid="scroll-events">{scrolls}</output>
      <output data-testid="scrollbar-state">{state}</output>
      <button
        onClick={() => {
          if (autoMounted) lastInstance.current = auto.current?.getOSInstance() ?? null;
          setAutoMounted(!autoMounted);
        }}
      >
        Toggle auto scrollbar
      </button>
      <button onClick={() => setDestroyed(lastInstance.current?.state().destroyed === true)}>
        Read destroyed scrollbar
      </button>
      <output data-testid="scrollbar-destroyed">{String(destroyed)}</output>
      {autoMounted && (
        <>
          <button onClick={() => setLimit(180)}>Expand scroll limits</button>
          <button onClick={() => setExplicitHeight(true)}>Set explicit scroll height</button>
          <button onClick={() => auto.current?.scrollTo({ left: 50, top: 60 })}>
            Scroll both axes
          </button>
          <Scrollbar
            ref={auto}
            data-testid="auto-scrollbar"
            outerStyle={{
              maxWidth: limit,
              maxHeight: limit,
              height: explicitHeight ? 80 : undefined,
            }}
          >
            <div style={{ width: 300, height: 300 }}>Unchanged scroll content</div>
          </Scrollbar>
        </>
      )}
    </section>
  );
}
