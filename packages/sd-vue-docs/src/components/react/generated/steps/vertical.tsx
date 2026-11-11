/** @jsxImportSource react */
import { Button, Step, Steps } from '@sdata/web-react';
import { IconLeft, IconRight } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [current, setCurrent] = useState(1);
  const onPrev = () => {
    setCurrent(Math.max(1, current - 1));
  };
  const onNext = () => {
    setCurrent(Math.min(3, current + 1));
  };

  return (
    <>
      <div data-v-895026ec="" className={'frame-bg'}>
        <div data-v-895026ec="" className={'frame-body'}>
          <div data-v-895026ec="" className={'frame-aside'}>
            <Steps data-v-895026ec="" current={current} direction={'vertical'}>
              <Step data-v-895026ec="">{'已成功'}</Step>
              <Step data-v-895026ec="">{'处理中'}</Step>
              <Step data-v-895026ec="">{'等待中'}</Step>
            </Steps>
          </div>
          <div data-v-895026ec="" className={'frame-main'}>
            <div data-v-895026ec="" className={'main-content'}>
              {'当前步骤的内容。'}
            </div>
            <div data-v-895026ec="" className={'main-bottom'}>
              <Button data-v-895026ec="" disabled={current === 1} onClick={onPrev}>
                <IconLeft data-v-895026ec="" />
                {' 返回 '}
              </Button>
              <Button data-v-895026ec="" disabled={current === 3} onClick={onNext}>
                {' 下一步 '}
                <IconRight data-v-895026ec="" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <style>
        {
          '.frame-bg[data-v-895026ec] {\n  max-width: 780px;\n  padding: 40px;\n  background: var(--color-fill-2);\n}\n.frame-body[data-v-895026ec] {\n  display: flex;\n  background: var(--color-bg-2);\n}\n.frame-aside[data-v-895026ec] {\n  height: 272px;\n  padding: 24px;\n  border-right: 1px solid var(--color-border);\n}\n.frame-main[data-v-895026ec] {\n  width: 100%;\n}\n.main-content[data-v-895026ec] {\n  line-height: 200px;\n  text-align: center;\n}\n.main-bottom[data-v-895026ec] {\n  display: flex;\n  justify-content: center;\n}\n.main-bottom button[data-v-895026ec] {\n  margin: 0 20px;\n}'
        }
      </style>
    </>
  );
}
