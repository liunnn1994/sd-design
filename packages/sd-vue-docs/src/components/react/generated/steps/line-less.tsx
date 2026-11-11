/** @jsxImportSource react */
import { Step, Steps } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Steps current={2} lineLess={true}>
        <Step description={'这是一段描述'}>{'已成功'}</Step>
        <Step description={'这是一段描述'}>{'处理中'}</Step>
        <Step description={'这是一段描述'}>{'等待中'}</Step>
      </Steps>
    </>
  );
}
