/** @jsxImportSource react */
import { Button, Input, SkeletonReveal } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <SkeletonReveal>
        <div
          className={'reveal-demo'}
          style={{
            display: 'grid',
            gap: '16px',
            padding: '24px',
            border: '1px solid var(--sd-color-border-2)',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0' }}>{'创建你的项目'}</h3>
          <Input placeholder={'项目名称'} />
          <Button type={'primary'}>{'创建项目'}</Button>
        </div>
      </SkeletonReveal>
    </>
  );
}
