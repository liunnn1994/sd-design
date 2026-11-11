/** @jsxImportSource react */
import type { StepsChangeHandler } from '@sdata/web-react';

import { getCssVarToken } from '@sdata/web-react';
import { Button, Space, Step, Steps } from '@sdata/web-react';
import { IconLeft, IconRight } from '@sdata/web-react/icon';
import { type CSSProperties, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [current, updateCurrent] = useState(1);
  function onPrev() {
    updateCurrent(Math.max(1, current - 1));
  }
  function onNext() {
    updateCurrent(Math.min(3, current + 1));
  }
  const setCurrent: StepsChangeHandler = (step) => {
    updateCurrent(step);
  };

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <Steps changeable={true} current={current} onChange={setCurrent}>
          <Step description={'这是一段描述'}>{'已成功'}</Step>
          <Step description={'这是一段描述'}>{'处理中'}</Step>
          <Step description={'这是一段描述'}>{'等待中'}</Step>
        </Steps>
        <div
          className={'sd:w-full sd:h-50 sd:text-center'}
          style={
            {
              backgroundColor: `var(${getCssVarToken('--color-bg-2')})`,
              color: '#c2c7cc',
            } as CSSProperties
          }
        >
          <div className={'sd:leading-40'}>
            {'步骤'}
            {formatValue(current)}
            {' 内容'}
          </div>
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
