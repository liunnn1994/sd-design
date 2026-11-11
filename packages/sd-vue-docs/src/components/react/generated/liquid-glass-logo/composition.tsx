/** @jsxImportSource react */
import { Button, LiquidGlassLogo, Space } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const background =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%232c5999'/%3E%3Cstop offset='1' stop-color='%23934a77'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23g)' d='M0 0h800v400H0z'/%3E%3C/svg%3E";
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
          backgroundImage={background}
          backgroundTintOpacity={0.15}
          height={320}
          aria-label={'SD Design 品牌展示'}
          fallback={
            <>
              <span>{'SD Design · 品牌展示'}</span>
            </>
          }
        />
      </Space>
    </>
  );
}
