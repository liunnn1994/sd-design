/** @jsxImportSource react */
import { Card, CardGrid, Link } from '@sdata/web-react';

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
      <Card data-v-f9dab4d4="" bordered={false} className={'sd:w-full'}>
        {new Array(7).map((_, index) => (
          <CardGrid
            data-v-f9dab4d4=""
            key={index}
            hoverable={index % 2 === 0}
            className={'sd:w-[25%]'}
          >
            <Card
              data-v-f9dab4d4=""
              className={'card-demo'}
              title={'SD 卡片'}
              bordered={false}
              extra={
                <>
                  <Link data-v-f9dab4d4="">{'更多'}</Link>
                </>
              }
            >
              <p data-v-f9dab4d4="" className={'sd:m-0'}>
                {formatValue(index % 2 === 0 ? 'Card allow to hover' : '卡片内容')}
              </p>
            </Card>
          </CardGrid>
        ))}
      </Card>
      <style>
        {
          '\n.card-demo[data-v-f9dab4d4] {\n    width: 100%;\n}\n.card-demo[data-v-f9dab4d4] .sd-card-header {\n    border: none;\n}\n'
        }
      </style>
    </>
  );
}
