/** @jsxImportSource react */
import { Card } from '@sdata/web-react';

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
      <div className={'sd:flex sd:gap-[16px]'}>
        <div className={'sd:h-[300px] sd:flex-1'}>
          <Card fullHeight={true} title={'Scrollbar 组件滚动'}>
            {Array.from({ length: 30 }, (_, index) => index + 1).map((n) => (
              <p key={n} className={'sd:leading-[24px]'}>
                {'第 '}
                {formatValue(n)}
                {' 行内容'}
              </p>
            ))}
          </Card>
        </div>
        <div className={'sd:h-[300px] sd:flex-1'}>
          <Card fullHeight={true} scrollbar={false} title={'原生 overflow 滚动'}>
            {Array.from({ length: 30 }, (_, index) => index + 1).map((n) => (
              <p key={n} className={'sd:leading-[24px]'}>
                {'第 '}
                {formatValue(n)}
                {' 行内容'}
              </p>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
