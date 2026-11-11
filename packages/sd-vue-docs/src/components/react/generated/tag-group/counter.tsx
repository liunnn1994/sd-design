/** @jsxImportSource react */
import { TagGroup } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const options = ['运行中', '高优先级', '数据库', '已同步'];

  return (
    <>
      <TagGroup
        options={options}
        maxCount={2}
        renderCounter={({ hiddenCount, counterClass }) => (
          <>
            <span className={counterClass}>
              {'还有 '}
              {formatValue(hiddenCount)}
              {' 项'}
            </span>
          </>
        )}
      />
    </>
  );
}
