import { useState } from 'react';

import { Button } from '../../src/button';
import { ConfigProvider } from '../../src/config-provider';
import { Timeline, TimelineItem } from '../../src/timeline';

export function TimelineFixture() {
  const [reverse, setReverse] = useState(false);
  const [pending, setPending] = useState(true);
  const [items, setItems] = useState(['A', 'B', 'C']);
  const [horizontal, setHorizontal] = useState(false);
  const [custom, setCustom] = useState(false);
  return (
    <section>
      <Button onClick={() => setReverse(!reverse)}>倒序时间轴</Button>
      <Button onClick={() => setPending(!pending)}>切换待办节点</Button>
      <Button onClick={() => setItems(['C', 'A'])}>重排时间轴</Button>
      <Button onClick={() => setHorizontal(!horizontal)}>切换时间轴方向</Button>
      <Button onClick={() => setCustom(!custom)}>切换待办内容</Button>
      <ConfigProvider timelineSpinProps={{ dot: true, tip: '全局等待' }}>
        <Timeline
          data-testid="timeline"
          reverse={reverse}
          mode="alternate"
          direction={horizontal ? 'horizontal' : 'vertical'}
          labelPosition="relative"
          pending={pending ? '等待节点' : false}
          spinProps={{ tip: '局部等待' }}
          pendingContent={custom ? <b>自定义待办</b> : undefined}
          dot={custom ? <i>待办图标</i> : undefined}
        >
          <>
            {items.map((item) => (
              <TimelineItem
                key={item}
                data-testid={`timeline-${item}`}
                label={<span>时间 {item}</span>}
                dotType="hollow"
                dotColor="rgb(10, 180, 42)"
                lineType="dotted"
                lineColor="rgb(200, 20, 30)"
              >
                {item}
              </TimelineItem>
            ))}
          </>
        </Timeline>
      </ConfigProvider>
      <Timeline data-testid="override-timeline" mode="alternate" direction="horizontal">
        <Timeline.Item position="bottom" dot={<b>★</b>} label="固定标签">
          指定位置
        </Timeline.Item>
        <Timeline.Item position="left">无效横向位置回退</Timeline.Item>
      </Timeline>
    </section>
  );
}
