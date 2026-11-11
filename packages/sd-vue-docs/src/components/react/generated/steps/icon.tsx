/** @jsxImportSource react */
import { Step, Steps } from '@sdata/web-react';
import { IconHome, IconLoading, IconThumbUp } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Steps>
        <Step
          description={'这是一段描述'}
          icon={
            <>
              <IconHome />
            </>
          }
        >
          {' 已成功 '}
        </Step>
        <Step
          description={'这是一段描述'}
          icon={
            <>
              <IconLoading />
            </>
          }
        >
          {' 处理中 '}
        </Step>
        <Step
          description={'这是一段描述'}
          icon={
            <>
              <IconThumbUp />
            </>
          }
        >
          {' 等待中 '}
        </Step>
      </Steps>
    </>
  );
}
