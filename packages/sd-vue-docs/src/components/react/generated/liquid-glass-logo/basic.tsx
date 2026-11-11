/** @jsxImportSource react */
import { Button, LiquidGlassLogo, PageHeader } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const glass = useRef<ComponentRef<typeof LiquidGlassLogo> | null>(null);

  return (
    <>
      <PageHeader
        showBack={false}
        subtitle={'Vue 组件库'}
        title={
          <>
            <LiquidGlassLogo
              ref={glass}
              logo={'/logo-icon.png'}
              logoColor={'original'}
              mark={'logo'}
              ending={'wordmark'}
              text={'Design'}
              fontSize={30}
              logoSize={32}
              logoScale={1}
              tile={false}
              background={'transparent'}
              aria-label={'SD Design 标志'}
            />
          </>
        }
        extra={
          <>
            <Button
              type={'primary'}
              onClick={() => {
                glass.current?.replay();
              }}
            >
              {'重新播放'}
            </Button>
          </>
        }
      />
    </>
  );
}
