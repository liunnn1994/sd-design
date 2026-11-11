/** @jsxImportSource react */
import type { TourInstance, TourStep, TourStepHook } from '@sdata/web-react';

import { Alert, Button, Checkbox, Space, Tag, Tour } from '@sdata/web-react';
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
  const [confirmed, setConfirmed] = useState(false);
  const onNextClick: TourStepHook = (_element, _step, { driver }) => {
    if (confirmed) driver.moveNext();
  };
  const steps: TourStep[] = [
    { element: '#tour-custom-target', popover: { side: 'bottom', align: 'center' } },
    { popover: {} },
  ];

  return (
    <>
      <Tour
        ref={tour}
        steps={steps}
        onNextClick={onNextClick}
        showProgress={true}
        renderTitle={({ index }) => (
          <>
            <Space>
              <Tag color={'blue'}>{'Vue 插槽'}</Tag>
              {formatValue(index === 0 ? '自定义内容' : '完成')}
            </Space>
          </>
        )}
        renderDescription={({ index }) => (
          <>
            {index === 0 ? (
              <div className={'sd:flex sd:flex-col sd:gap-3'}>
                <strong>{'直接使用 Vue 组件和响应式状态'}</strong>
                <Checkbox
                  modelValue={confirmed}
                  onValueChange={(next) => setConfirmed(next as typeof confirmed)}
                >
                  {'我已了解这项操作'}
                </Checkbox>
              </div>
            ) : (
              <Alert type={'success'}>{'所有步骤均可使用组件库组件，无需拼接 HTML。'}</Alert>
            )}
          </>
        )}
        renderFooter={({ driver, index }) => (
          <>
            <Space fill={true}>
              <Button
                size={'small'}
                onClick={() => {
                  driver.drive(0);
                }}
              >
                {'重新开始'}
              </Button>
              {index === 0 ? (
                <Button
                  size={'small'}
                  type={'primary'}
                  disabled={!confirmed}
                  onClick={() => {
                    driver.moveNext();
                  }}
                >
                  {'下一步'}
                </Button>
              ) : (
                <Button
                  size={'small'}
                  type={'primary'}
                  onClick={() => {
                    driver.destroy();
                  }}
                >
                  {'完成'}
                </Button>
              )}
            </Space>
          </>
        )}
      >
        <div className={'sd:flex sd:flex-col sd:gap-4'}>
          <Button
            type={'primary'}
            onClick={() => {
              tour.current?.drive();
            }}
          >
            {'开始自定义导览'}
          </Button>
          <Button id={'tour-custom-target'}>{'目标区域'}</Button>
        </div>
      </Tour>
    </>
  );
}
