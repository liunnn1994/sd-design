import { useState } from 'react';

import type { ResultStatus } from '../../src/result/index.js';

import { Button } from '../../src/button/index.js';
import { Result } from '../../src/result/index.js';

export function ResultFixture() {
  const [status, setStatus] = useState<ResultStatus>();
  const [count, setCount] = useState(0);
  const [showContent, setShowContent] = useState(true);
  const [customIcon, setCustomIcon] = useState(false);
  return (
    <section>
      <label>
        结果状态
        <select
          aria-label="结果状态"
          value={status === null ? 'custom' : (status ?? 'info')}
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
      <Button onClick={() => setShowContent(!showContent)}>切换结果内容</Button>
      <Button onClick={() => setCustomIcon(!customIcon)}>切换结果图标</Button>
      <Result
        data-testid="result"
        status={status}
        title={showContent ? <strong>结果标题</strong> : undefined}
        subtitle={showContent ? '结果说明' : undefined}
        icon={status === null || customIcon ? <span>自定义结果</span> : undefined}
        extra={
          showContent ? (
            <Button onClick={() => setCount(count + 1)}>重试结果 {count}</Button>
          ) : undefined
        }
      >
        {showContent ? '结果详情' : undefined}
      </Result>
      <Result data-testid="result-duplicate" status={status} />
    </section>
  );
}
