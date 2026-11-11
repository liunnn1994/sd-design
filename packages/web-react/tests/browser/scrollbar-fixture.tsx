import { useRef, useState } from 'react';

import type { ScrollbarExposed } from '../../src/scrollbar/index';

import { Button } from '../../src/button/index';
import { Scrollbar } from '../../src/scrollbar/index';
import { Tooltip } from '../../src/tooltip/index';

export function ScrollbarFixture() {
  const ref = useRef<ScrollbarExposed>(null);
  const [items, setItems] = useState(10);
  const [scrolls, setScrolls] = useState(0);
  const [track, setTrack] = useState(false);
  return (
    <section>
      <Button tooltip="按钮提示内容">带提示按钮</Button>
      <Button
        tooltip={{ content: '原始提示', position: 'bottom' }}
        tooltipContent={<strong>覆盖提示内容</strong>}
      >
        自定义提示按钮
      </Button>
      <Scrollbar
        ref={ref}
        data-testid="scrollbar"
        type={track ? 'track' : 'embed'}
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
      <output data-testid="scroll-events">{scrolls}</output>
      <Tooltip content="普通提示内容">
        <button>普通提示</button>
      </Tooltip>
      <Tooltip content={<div style={{ height: 1000 }}>溢出提示内容</div>}>
        <button>溢出提示</button>
      </Tooltip>
      <Tooltip popupVisible={false} content="受控拒绝提示">
        <button>锁定提示</button>
      </Tooltip>
    </section>
  );
}
