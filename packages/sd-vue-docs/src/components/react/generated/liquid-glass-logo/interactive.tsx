/** @jsxImportSource react */
import { Button, LiquidGlassLogo, Space } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const glass = useRef<ComponentRef<typeof LiquidGlassLogo> | null>(null);
  const [paused, setPaused] = useState(false);
  async function replay() {
    setPaused(false);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    glass.current?.replay();
  }

  return (
    <>
      <div data-v-6d22a8e3="" className={'liquid-glass-interactive'}>
        <Space data-v-6d22a8e3="" wrap={true}>
          <Button data-v-6d22a8e3="" type={'primary'} onClick={replay}>
            {'重新播放'}
          </Button>
          <Button
            data-v-6d22a8e3=""
            type={'outline'}
            status={paused ? 'success' : 'warning'}
            onClick={() => {
              setPaused(!paused);
            }}
          >
            {formatValue(paused ? '继续播放' : '暂停播放')}
          </Button>
          <Button
            data-v-6d22a8e3=""
            type={'outline'}
            onClick={() => {
              glass.current?.seek(3.3);
            }}
          >
            {'查看最终字标'}
          </Button>
        </Space>
        <LiquidGlassLogo
          data-v-6d22a8e3=""
          autoWidth={false}
          ref={glass}
          logo={'/logo-icon.png'}
          logoColor={'original'}
          mark={'logo'}
          text={'Design'}
          ending={'wordmark'}
          paused={paused}
          height={320}
        />
      </div>
      <style>
        {
          '.liquid-glass-interactive[data-v-6d22a8e3] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}'
        }
      </style>
    </>
  );
}
