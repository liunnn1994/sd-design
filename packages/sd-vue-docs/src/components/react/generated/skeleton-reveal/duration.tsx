/** @jsxImportSource react */
import { Button, SkeletonReveal } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const reveal = useRef<ComponentRef<typeof SkeletonReveal> | null>(null);

  return (
    <>
      <div style={{ display: 'grid', gap: '16px' }}>
        <Button
          onClick={() => {
            reveal.current?.replay();
          }}
        >
          {'播放较慢的入场'}
        </Button>
        <SkeletonReveal ref={reveal} autoplay={false} duration={2400}>
          <div
            style={{
              padding: '24px',
              border: '1px solid var(--sd-color-border-2)',
              borderRadius: '8px',
            }}
          >
            <h3>{'让界面逐渐成形'}</h3>
            <p>{'自定义时长；动画结束后不再运行。'}</p>
          </div>
        </SkeletonReveal>
      </div>
    </>
  );
}
