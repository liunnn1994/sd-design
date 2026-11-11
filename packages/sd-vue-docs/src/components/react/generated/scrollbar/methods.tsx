/** @jsxImportSource react */
import { Button, Scrollbar, Space } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  interface ScrollbarInstance {
    scrollTo: (options?: number | { left?: number; top?: number }, y?: number) => void;
    state: () => { hasOverflow: { x: boolean; y: boolean } } | undefined;
    update: (force?: boolean) => boolean;
  }
  const scrollbarRef = useRef<ComponentRef<typeof Scrollbar> | null>(null);
  const [statusText, setStatusText] = useState('ready');
  const scrollToCenter = () => {
    scrollbarRef.current?.scrollTo({ top: 180, left: 260 });
    setStatusText('scrollTo');
  };
  const syncState = () => {
    const state = scrollbarRef.current?.state();
    if (!state) {
      setStatusText('no-instance');
      return;
    }

    setStatusText(`overflow:${Number(state.hasOverflow.x)}/${Number(state.hasOverflow.y)}`);
  };
  const forceUpdate = () => {
    const changed = scrollbarRef.current?.update(true) ?? false;
    setStatusText(changed ? 'updated' : 'no-change');
  };

  return (
    <>
      <Space direction={'vertical'} fill={true}>
        <Space>
          <Button size={'small'} onClick={scrollToCenter}>
            {'scrollTo'}
          </Button>
          <Button size={'small'} onClick={syncState}>
            {'状态'}
          </Button>
          <Button size={'small'} onClick={forceUpdate}>
            {'更新'}
          </Button>
        </Space>
        <div className={'sd:text-[var(--color-text-3)]'}>
          {'状态： '}
          {formatValue(statusText)}
        </div>
        <Scrollbar ref={scrollbarRef} className={'sd:h-55 sd:overflow-auto'}>
          <div
            className={
              'sd:w-225 sd:h-135 sd:p-5 sd:bg-[linear-gradient(180deg, var(--color-fill-2), var(--color-secondary-light-1))]'
            }
          >
            {' 通过 ref 调用底层 OverlayScrollbars 方法。 '}
          </div>
        </Scrollbar>
      </Space>
    </>
  );
}
