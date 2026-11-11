/** @jsxImportSource react */
import { Step, Steps } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Steps type={'navigation'}>
        <Step>{'已成功'}</Step>
        <Step>{'处理中'}</Step>
        <Step>{'等待中'}</Step>
      </Steps>
    </>
  );
}
