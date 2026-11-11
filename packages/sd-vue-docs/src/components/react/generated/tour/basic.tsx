/** @jsxImportSource react */
import type { TourInstance, TourStep } from '@sdata/web-react';

import { Button, Tour } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const tour = useRef<ComponentRef<typeof Tour> | null>(null);
  const steps: TourStep[] = [
    {
      element: '#tour-basic-filter',
      popover: { title: '筛选条件', description: '先确定查询范围。' },
    },
    {
      element: '#tour-basic-result',
      popover: { title: '结果面板', description: '在这里查看查询结果。' },
    },
  ];

  return (
    <>
      <Tour
        ref={tour}
        steps={steps}
        showProgress={true}
        nextBtnText={'下一步'}
        prevBtnText={'上一步'}
        doneBtnText={'完成'}
        progressText={'第 {{current}} / {{total}} 步'}
      >
        <div className={'sd:flex sd:flex-col sd:gap-4'}>
          <Button
            type={'primary'}
            onClick={() => {
              tour.current?.drive();
            }}
          >
            {'开始导览'}
          </Button>
          <Button id={'tour-basic-filter'}>{'筛选条件'}</Button>
          <Button id={'tour-basic-result'}>{'结果面板'}</Button>
        </div>
      </Tour>
    </>
  );
}
