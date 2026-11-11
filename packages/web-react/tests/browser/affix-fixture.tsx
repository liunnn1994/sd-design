import { useRef, useState } from 'react';

import { Affix, type AffixExposed } from '../../src/index';

export function AffixFixture() {
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState(40);
  const [offset, setOffset] = useState(10);
  const [second, setSecond] = useState(false);
  const [width, setWidth] = useState(280);
  const [bottom, setBottom] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const affix = useRef<AffixExposed>(null);
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? '卸载固钉夹具' : '加载固钉夹具'}
      </button>
      <output data-testid="affix-events">{events.join(',')}</output>
      {mounted && (
        <>
          <button onClick={() => setHeight(height === 40 ? 90 : 40)}>改变固钉高度</button>
          <button onClick={() => setOffset(offset === 10 ? 30 : 10)}>改变固钉偏移</button>
          <button onClick={() => setSecond(!second)}>切换固钉目标</button>
          <button onClick={() => setWidth(width === 280 ? 340 : 280)}>改变固钉宽度</button>
          <button onClick={() => setBottom(!bottom)}>切换底部固钉</button>
          <button onClick={() => affix.current?.updatePosition()}>刷新固钉位置</button>
          <div id="affix-outer" style={{ height: 300, width, overflow: 'auto' }}>
            <div style={{ height: 70 }} />
            <div id="affix-first" style={{ height: 180, overflow: 'auto' }}>
              <div style={{ height: bottom ? 250 : 100 }} />
              <Affix
                ref={affix}
                data-testid="affix-wrapper"
                target={second ? '#affix-second' : '#affix-first'}
                targetContainer="#affix-outer"
                offsetTop={offset}
                offsetBottom={bottom ? 15 : undefined}
                onChange={(value) => setEvents((values) => [...values, String(value)])}
              >
                <div data-testid="affix-content" style={{ height, background: 'white' }}>
                  固钉内容
                </div>
              </Affix>
              <div style={{ height: 600 }} />
            </div>
            <div style={{ height: 40 }} />
            <div id="affix-second" style={{ height: 140, overflow: 'auto' }}>
              <div style={{ height: 500 }} />
            </div>
            <div style={{ height: 300 }} />
          </div>
        </>
      )}
    </section>
  );
}
