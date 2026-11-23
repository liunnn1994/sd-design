import { useState } from 'react';

import { Button } from '../../src/button/index.js';
import { Steps, Step, type StepsType } from '../../src/steps/index.js';

export function StepsFixture() {
  const [current, setCurrent] = useState(1);
  const [requests, setRequests] = useState(0);
  const [items, setItems] = useState(['A', 'B', 'C']);
  const [error, setError] = useState(true);
  const [type, setType] = useState<StepsType>('default');
  const [lineLess, setLineLess] = useState(false);
  return (
    <section>
      {[false, true].map((small) => (
        <Steps key={String(small)} data-testid={`icon-steps-${small}`} small={small} current={2}>
          <Step title="已成功" />
          <Step title="处理中" />
          <Step title="错误" status="error" />
          <Step title="等待中" />
        </Steps>
      ))}
      <Button onClick={() => setCurrent(current === 1 ? 2 : 1)}>外部切换步骤</Button>
      <Button onClick={() => setItems(['C', 'A'])}>重排步骤</Button>
      <Button onClick={() => setError(!error)}>切换步骤错误</Button>
      <Button
        onClick={() =>
          setType(
            type === 'default'
              ? 'dot'
              : type === 'dot'
                ? 'arrow'
                : type === 'arrow'
                  ? 'navigation'
                  : 'default',
          )
        }
      >
        切换步骤类型
      </Button>
      <Button onClick={() => setLineLess(!lineLess)}>切换步骤连接线</Button>
      <output data-testid="step-requests">{requests}</output>
      <Steps
        data-testid="controlled-steps"
        current={current}
        changeable
        onChange={() => setRequests((value) => value + 1)}
      >
        <Step title="受控第一步" />
        <Step title="受控第二步" />
        <Step title="禁用步骤" disabled />
      </Steps>
      <Steps
        data-testid="dynamic-steps"
        defaultCurrent={2}
        changeable
        type={type}
        direction="vertical"
        small
        lineLess={lineLess}
      >
        <div>
          {items.map((item) => (
            <Step
              key={item}
              title={item}
              status={item === 'B' && error ? 'error' : undefined}
              description={`描述 ${item}`}
            />
          ))}
        </div>
        <Steps data-testid="nested-steps">
          <Step title="内层步骤" />
        </Steps>
      </Steps>
      <Steps data-testid="custom-steps">
        <Step
          title="被覆盖标题"
          node={({ step, status }) => (
            <b>
              {step}:{status}
            </b>
          )}
        >
          自定义标题
        </Step>
        <Step title="自定义图标" icon={({ step }) => <i>图标 {step}</i>} />
      </Steps>
    </section>
  );
}
