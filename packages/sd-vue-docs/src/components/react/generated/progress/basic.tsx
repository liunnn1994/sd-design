/** @jsxImportSource react */
import { Progress } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  return (
    <>
      <Progress percent={0.2} className={'sd:w-[50%]'} />
      <br />
      <br />
      <Progress
        percent={0.3}
        className={'sd:w-[50%]'}
        text={(scope) => (
          <>
            {' 进度 '}
            {formatValue(scope.percent * 100)}
            {'% '}
          </>
        )}
      />
    </>
  );
}
