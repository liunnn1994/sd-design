/** @jsxImportSource react */
import type { SenderInstance } from '@sdata/web-react';

import { Alert, Button, Sender } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const senderRef = useRef<ComponentRef<typeof Sender> | null>(null);
  const [currentValue, setCurrentValue] = useState('');
  function clear() {
    senderRef.current?.clear();
    readValue();
  }
  function readValue() {
    setCurrentValue(senderRef.current?.getValue().value ?? '');
  }

  return (
    <>
      <div data-v-a5758f10="" className={'sender-demo'}>
        <div data-v-a5758f10="" className={'sender-demo-actions'}>
          <Button
            data-v-a5758f10=""
            size={'small'}
            onClick={() => {
              senderRef.current?.insert('请简洁回答：', 'start');
            }}
          >
            {' 开头插入 '}
          </Button>
          <Button
            data-v-a5758f10=""
            size={'small'}
            onClick={() => {
              senderRef.current?.insert('，并给出示例', 'end');
            }}
          >
            {' 末尾插入 '}
          </Button>
          <Button
            data-v-a5758f10=""
            size={'small'}
            onClick={() => {
              senderRef.current?.focus({ cursor: 'all' });
            }}
          >
            {' 全选聚焦 '}
          </Button>
          <Button data-v-a5758f10="" size={'small'} type={'text'} onClick={clear}>
            {'清空'}
          </Button>
          <Button data-v-a5758f10="" size={'small'} type={'text'} onClick={readValue}>
            {'读取内容'}
          </Button>
        </div>
        <Sender data-v-a5758f10="" ref={senderRef} defaultValue={'介绍一下 VueUse'} />
        <Alert data-v-a5758f10="" type={'info'}>
          {'getValue()：'}
          {formatValue(currentValue || '暂无内容')}
        </Alert>
      </div>
      <style>
        {
          '\n.sender-demo[data-v-a5758f10] {\n    display: grid;\n    gap: 12px;\n}\n.sender-demo-actions[data-v-a5758f10] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n}\n'
        }
      </style>
    </>
  );
}
