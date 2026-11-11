/** @jsxImportSource react */
import type { StepsChangeHandler } from '@sdata/web-react';

import { Button, Popover, Space, Step, Steps } from '@sdata/web-react';
import { IconLeft, IconRight } from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [current, updateCurrent] = useState(1);
  const onPrev = () => {
    updateCurrent(Math.max(1, current - 1));
  };
  const onNext = () => {
    updateCurrent(Math.min(3, current + 1));
  };
  const setCurrent: StepsChangeHandler = (step) => {
    updateCurrent(step);
  };

  return (
    <>
      <div>
        <Steps
          changeable={true}
          labelPlacement={'vertical'}
          current={current}
          onChange={setCurrent}
        >
          <Step
            description={'这是一段描述'}
            node={(slotProps) => (
              <>
                <Popover content={'步骤提示'} popupVisible={current === 1}>
                  <span>{formatValue(slotProps.step)}</span>
                </Popover>
              </>
            )}
          >
            {' 已成功 '}
          </Step>
          <Step
            description={'这是一段描述'}
            node={(slotProps) => (
              <>
                <Popover content={'步骤提示'} popupVisible={current === 2}>
                  <span>{formatValue(slotProps.step)}</span>
                </Popover>
              </>
            )}
          >
            {' 处理成功 '}
          </Step>
          <Step
            description={'这是一段描述'}
            node={(slotProps) => (
              <>
                <Popover content={'步骤提示'} popupVisible={current === 3}>
                  <span>{formatValue(slotProps.step)}</span>
                </Popover>
              </>
            )}
          >
            {'等待中 '}
          </Step>
        </Steps>
        <div className={'sd:mt-5 sd:text-center'}>
          <Space size={'large'}>
            <Button type={'secondary'} disabled={current <= 1} onClick={onPrev}>
              <IconLeft />
              {' 返回 '}
            </Button>
            <Button type={'primary'} disabled={current >= 3} onClick={onNext}>
              {' 下一步 '}
              <IconRight />
            </Button>
          </Space>
        </div>
      </div>
    </>
  );
}
