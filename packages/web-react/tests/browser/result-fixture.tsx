import { useState } from 'react';

import type { ResultStatus } from '../../src/index';

import { Button, Result } from '../../src/index';

export function ResultFixture() {
  const [status, setStatus] = useState<ResultStatus>('info');
  const [count, setCount] = useState(0);
  return (
    <section>
      <label>
        结果状态
        <select
          aria-label="结果状态"
          value={status ?? 'custom'}
          onChange={(event) =>
            setStatus(event.target.value === 'custom' ? null : (event.target.value as ResultStatus))
          }
        >
          {['info', 'success', 'warning', 'error', '403', '404', '500', 'custom', 'invalid'].map(
            (value) => (
              <option key={value}>{value}</option>
            ),
          )}
        </select>
      </label>
      <Result
        data-testid="result"
        status={status}
        title={<strong>结果标题</strong>}
        subtitle="结果说明"
        icon={status === null ? <span>自定义结果</span> : undefined}
        extra={<Button onClick={() => setCount(count + 1)}>重试结果 {count}</Button>}
      >
        结果详情
      </Result>
      <Result data-testid="result-duplicate" status={status} />
    </section>
  );
}
