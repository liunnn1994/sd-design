/** @jsxImportSource react */
import { Button, LiquidGlassLogo, Space } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const glass = useRef<ComponentRef<typeof LiquidGlassLogo> | null>(null);

  return (
    <>
      <Space direction={'vertical'} fill={true} size={16}>
        <Button
          type={'primary'}
          onClick={() => {
            glass.current?.replay();
          }}
        >
          {'重新播放'}
        </Button>
        <LiquidGlassLogo
          autoWidth={false}
          ref={glass}
          logo={'/logo-icon.png'}
          logoColor={'original'}
          height={256}
          aria-label={'SD Design 标志'}
        />
      </Space>
    </>
  );
}
