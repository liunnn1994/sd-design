/** @jsxImportSource react */
import { Divider, Step, Steps } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div>
        <Steps current={2} small={true}>
          <Step>{'已成功'}</Step>
          <Step>{'处理中'}</Step>
          <Step>{'等待中'}</Step>
        </Steps>
        <Divider />
        <div className={'sd:text-[#c9cdd4] sd:leading-35 sd:text-center'}>{' 步骤 2 的内容 '}</div>
      </div>
    </>
  );
}
