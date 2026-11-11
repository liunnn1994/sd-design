/** @jsxImportSource react */
import type { TourInstance } from '@sdata/web-react';

import { Button, Tour } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const tour = useRef<ComponentRef<typeof Tour> | null>(null);

  return (
    <>
      <Tour ref={tour} overlayOpacity={0.2} animate={false} stagePadding={8} stageRadius={6}>
        <div className={'sd:flex sd:flex-col sd:gap-4'}>
          <Button
            type={'primary'}
            onClick={() => {
              tour.current?.highlight({
                element: '#tour-highlight-target',
                popover: {
                  title: '单元素高亮',
                  description: '直接调用原生 highlight，不需要 steps 数组。',
                  showButtons: ['close'],
                },
              });
            }}
          >
            {'高亮单个元素'}
          </Button>
          <Button id={'tour-highlight-target'}>{'需要关注的操作'}</Button>
        </div>
      </Tour>
    </>
  );
}
