/** @jsxImportSource react */
import { Button, Input, SkeletonReveal, Space } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const reveal = useRef<ComponentRef<typeof SkeletonReveal> | null>(null);

  return (
    <>
      <div style={{ display: 'grid', gap: '16px' }}>
        <Space>
          <Button
            onClick={() => {
              reveal.current?.replay();
            }}
          >
            {'重新播放'}
          </Button>
          <Button
            onClick={() => {
              reveal.current?.finish();
            }}
          >
            {'立即显示'}
          </Button>
        </Space>
        <SkeletonReveal ref={reveal} autoplay={false}>
          <div
            style={{
              padding: '24px',
              border: '1px solid var(--sd-color-border-2)',
              borderRadius: '8px',
            }}
          >
            <p>{'点击或聚焦输入框，会直接进入可用状态。'}</p>
            <Input placeholder={'动画不会阻挡你的输入'} />
          </div>
        </SkeletonReveal>
      </div>
    </>
  );
}
