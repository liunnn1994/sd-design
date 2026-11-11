import { useState } from 'react';

import { Card, CardMeta, CardGrid, ConfigProvider, Button, Avatar } from '../../src/index';

function WrappedMeta() {
  return (
    <div>
      <CardMeta title="嵌套详情" description="描述" avatar={<Avatar>A</Avatar>} />
    </div>
  );
}

export function CardFixture() {
  const [meta, setMeta] = useState(true);
  const [count, setCount] = useState(2);
  const [actions, setActions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [native, setNative] = useState(false);
  const [header, setHeader] = useState(true);
  const [clicks, setClicks] = useState(0);
  return (
    <section>
      <Button onClick={() => setMeta(!meta)}>切换卡片详情</Button>
      <Button onClick={() => setCount(Math.max(0, count - 1))}>移除卡片网格</Button>
      <Button onClick={() => setActions(!actions)}>切换卡片操作</Button>
      <Button onClick={() => setLoading(!loading)}>切换卡片加载</Button>
      <Button onClick={() => setNative(!native)}>切换卡片滚动</Button>
      <Button onClick={() => setHeader(!header)}>切换卡片标题</Button>
      <ConfigProvider size="mini" cardSpinProps={{ tip: '全局卡片加载' }}>
        <Card
          data-testid="card-meta"
          hoverable
          loading={loading}
          title={header ? '卡片标题' : undefined}
          extra="更多"
          cover={<div>封面</div>}
          headerStyle={{ color: 'rgb(255, 0, 0)' }}
          actions={
            actions ? (
              <>
                <Button onClick={() => setClicks(clicks + 1)}>卡片操作 {clicks}</Button>
                <span>第二项</span>
              </>
            ) : undefined
          }
        >
          {meta ? <WrappedMeta /> : <p>普通正文</p>}
        </Card>
        <Card data-testid="card-grid" bordered={false} size="medium">
          {Array.from({ length: count }, (_, index) => (
            <CardGrid hoverable key={index}>
              网格 {index}
            </CardGrid>
          ))}
        </Card>
        <Card data-testid="card-local-spin" loading spinProps={{ tip: '局部卡片加载' }} />
      </ConfigProvider>
      <div style={{ height: 180, width: 320 }}>
        <Card
          data-testid="card-scroll"
          fullHeight
          title="滚动卡片"
          scrollbar={native ? false : { type: 'track' }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>滚动行 {i}</p>
          ))}
        </Card>
      </div>
    </section>
  );
}
