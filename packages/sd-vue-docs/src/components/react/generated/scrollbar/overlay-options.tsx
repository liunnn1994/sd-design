/** @jsxImportSource react */
import { Scrollbar } from '@sdata/web-react';

export default function Example() {
  const overlayOptions = {
    update: {
      debounce: {
        // debounce 的值是 [timeout, maxWait] 元组，字面量数组会被推断成 number[]
        event: [10, 20] as [number, number],
      },
    },
    scrollbars: {
      autoHideSuspend: true,
    },
  };
  const scrollbarOptions = {
    autoHide: 'move' as const,
    autoHideDelay: 500,
    dragScroll: true,
  };

  return (
    <>
      <Scrollbar
        className={'sd:h-55 sd:overflow-auto'}
        paddingAbsolute={true}
        overflow={{ x: 'scroll', y: 'scroll' }}
        updateOptions={overlayOptions.update}
        scrollbars={scrollbarOptions}
        overlayOptions={overlayOptions}
      >
        <div
          className={
            'sd:w-300 sd:h-130 sd:p-5 sd:bg-[linear-gradient(135deg, var(--color-fill-2), var(--color-primary-light-1))]'
          }
        >
          {'通过组件 props 直接配置 OverlayScrollbars。'}
        </div>
      </Scrollbar>
    </>
  );
}
