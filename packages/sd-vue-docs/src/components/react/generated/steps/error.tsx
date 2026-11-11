/** @jsxImportSource react */
import { Step, Steps } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Steps current={2} status={'error'}>
        <Step description={'这是一段描述'}>{'已成功'}</Step>
        <Step description={'这是一段描述'}>{'错误'}</Step>
        <Step description={'这是一段描述'}>{'等待中'}</Step>
      </Steps>
    </>
  );
}
