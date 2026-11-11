/** @jsxImportSource react */
import type { TourInstance, TourProps, TourStep } from '@sdata/web-react';

import { Button, Tour } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const tour = useRef<ComponentRef<typeof Tour> | null>(null);
  const [current, setCurrent] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('尚未开始');
  const steps: TourStep[] = [
    {
      element: '#tour-api-first',
      popover: { title: '第一个目标', description: '下一步使用原生 moveNext 方法。' },
    },
    {
      element: '#tour-api-second',
      popover: { title: '第二个目标', description: '可从任意步骤启动，也可随时销毁。' },
    },
  ];
  const onHighlighted: TourProps['onHighlighted'] = (_element, _step, { driver, index }) => {
    setCurrent(index);
    setStatus(driver.isActive() ? '进行中' : '已结束');
  };
  const onDestroyed: TourProps['onDestroyed'] = () => {
    setStatus('已结束');
  };

  return (
    <>
      <Tour
        ref={tour}
        steps={steps}
        onHighlighted={onHighlighted}
        onDestroyed={onDestroyed}
        nextBtnText={'下一步'}
        prevBtnText={'上一步'}
        doneBtnText={'完成'}
      >
        <div className={'sd:flex sd:flex-col sd:gap-4'}>
          <div>
            {'状态：'}
            {formatValue(status)}
            {'，步骤下标：'}
            {formatValue(current ?? '无')}
          </div>
          <Button
            type={'primary'}
            onClick={() => {
              tour.current?.drive(1);
            }}
          >
            {'从第二步开始'}
          </Button>
          <div id={'tour-api-first'}>
            <Button
              onClick={() => {
                tour.current?.moveNext();
              }}
            >
              {'业务操作：下一步'}
            </Button>
          </div>
          <div id={'tour-api-second'}>
            <Button
              onClick={() => {
                tour.current?.destroy();
              }}
            >
              {'结束导览'}
            </Button>
          </div>
        </div>
      </Tour>
    </>
  );
}
