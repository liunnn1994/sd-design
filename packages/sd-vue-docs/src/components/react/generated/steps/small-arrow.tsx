/** @jsxImportSource react */
import { Step, Steps } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div>
        <Steps type={'arrow'} current={2} small={true} className={'sd:mb-5'}>
          <Step description={'这是一段描述'}>{'已成功'}</Step>
          <Step description={'这是一段描述'}>{'处理中'}</Step>
          <Step description={'这是一段描述'}>{'等待中'}</Step>
        </Steps>
        <Steps type={'arrow'} current={2} small={true} status={'error'}>
          <Step description={'这是一段描述'}>{'已成功'}</Step>
          <Step description={'这是一段描述'}>{'处理中'}</Step>
          <Step description={'这是一段描述'}>{'等待中'}</Step>
        </Steps>
      </div>
    </>
  );
}
