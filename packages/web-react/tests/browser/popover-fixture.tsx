import { useState } from 'react';

import { Popover } from '../../src/popover/index';

export function PopoverFixture() {
  const [scrollbar, setScrollbar] = useState(true);
  const [count, setCount] = useState(0);
  const [requests, setRequests] = useState<boolean[]>([]);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [hoverEvents, setHoverEvents] = useState<boolean[]>([]);
  const [showDefault, setShowDefault] = useState(false);
  return (
    <section style={{ minHeight: '180vh' }}>
      <Popover
        trigger="click"
        title={<strong>弹出标题</strong>}
        scrollbar={scrollbar ? { type: 'track', outerStyle: { height: 100 } } : false}
        content={
          <div style={{ height: 180 }}>
            <button onClick={() => setCount(count + 1)}>弹层内计数</button>
            <output data-testid="popover-count">{count}</output>
            <button onClick={() => setScrollbar(!scrollbar)}>切换弹层滚动</button>
          </div>
        }
      >
        <button data-testid="popover-trigger">打开 Popover</button>
      </Popover>
      <Popover
        trigger="click"
        popupVisible={controlledOpen}
        onPopupVisibleChange={(next) => setRequests((previous) => [...previous, next])}
        content="受控内容"
      >
        <button>拒绝打开 Popover</button>
      </Popover>
      <button onClick={() => setControlledOpen(!controlledOpen)}>Toggle controlled popover</button>
      <output data-testid="popover-requests">{requests.join('|')}</output>
      <button onClick={() => setShowDefault(!showDefault)}>挂载默认打开</button>
      {showDefault && (
        <Popover defaultPopupVisible title="默认标题" content="默认打开内容">
          <button>默认打开触发器</button>
        </Popover>
      )}
      <Popover trigger="focus" content="Focus content">
        <button>Focus reference</button>
      </Popover>
      <Popover
        content="Hover content"
        position="right"
        autoFitPosition={false}
        contentClass="custom-popover-content"
        contentStyle={{ backgroundColor: 'rgb(18, 52, 86)' }}
        arrowClass="custom-popover-arrow"
        onPopupVisibleChange={(next) => setHoverEvents((previous) => [...previous, next])}
      >
        <button>Hover reference</button>
      </Popover>
      <output data-testid="popover-hover-events">{hoverEvents.join('|')}</output>
      <Popover trigger="contextMenu" content="Context content" popupContainer="#popover-host">
        <button>Context reference</button>
      </Popover>
      <div id="popover-host" />
      <div style={{ marginTop: 660 }}>
        <Popover
          trigger="click"
          content={
            <Popover trigger="click" position="right" content="嵌套 Popover 内容">
              <button>打开子 Popover</button>
            </Popover>
          }
        >
          <button>打开父 Popover</button>
        </Popover>
      </div>
    </section>
  );
}
