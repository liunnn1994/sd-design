/** @jsxImportSource react */
import { Button, NumberFlow, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [revenue, setRevenue] = useState(128600);
  function randomize() {
    setRevenue(Math.floor(Math.random() * 1_000_000));
  }

  return (
    <>
      <Space data-v-29318cc9="" direction={'vertical'} size={'large'}>
        <NumberFlow
          data-v-29318cc9=""
          value={revenue}
          format={{ maximumFractionDigits: 0 }}
          prefixContent={
            <>
              <span data-v-29318cc9="" className={'label'}>
                {'本月收入'}
              </span>
            </>
          }
          suffixContent={
            <>
              <span data-v-29318cc9="" className={'unit'}>
                {'元'}
              </span>
            </>
          }
        />
        <Button data-v-29318cc9="" type={'primary'} onClick={randomize}>
          {'切换随机数'}
        </Button>
      </Space>
      <style>
        {
          '\n.label[data-v-29318cc9] {\n    color: var(--sd-color-text-2);\n    font-size: 14px;\n}\n.unit[data-v-29318cc9] {\n    color: var(--sd-color-text-2);\n    font-size: 14px;\n}\n'
        }
      </style>
    </>
  );
}
