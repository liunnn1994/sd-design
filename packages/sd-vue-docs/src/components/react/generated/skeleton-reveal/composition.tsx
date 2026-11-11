/** @jsxImportSource react */
import { Button, SkeletonReveal, Space, Tag } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const reveal = useRef<ComponentRef<typeof SkeletonReveal> | null>(null);

  return (
    <>
      <div className={'skeleton-reveal-composition'} style={{ display: 'grid', gap: '16px' }}>
        <Button
          onClick={() => {
            reveal.current?.replay();
          }}
        >
          {'重播组合内容'}
        </Button>
        <SkeletonReveal ref={reveal}>
          <article
            style={{
              display: 'grid',
              gap: '16px',
              padding: '24px',
              border: '1px solid var(--sd-color-border-2)',
              borderRadius: '8px',
            }}
          >
            <Space>
              <Tag color={'green'}>{'已就绪'}</Tag>
              <strong>{'界面原型'}</strong>
            </Space>
            <p>{'默认插槽可以组合卡片、表单和其他真实内容。'}</p>
            <Button type={'primary'}>{'开始编辑'}</Button>
          </article>
        </SkeletonReveal>
      </div>
    </>
  );
}
