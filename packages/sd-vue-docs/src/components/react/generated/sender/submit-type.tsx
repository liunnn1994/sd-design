/** @jsxImportSource react */
import { Alert, Sender } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [enterValue, setEnterValue] = useState('');
  const [shiftEnterValue, setShiftEnterValue] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  function handleSubmit(shortcut: string, value: string) {
    setLastMessage(`${shortcut} 已发送：${value}`);
  }

  return (
    <>
      <div data-v-5cccd45a="" className={'sender-demo'}>
        <section data-v-5cccd45a="">
          <div data-v-5cccd45a="" className={'sender-demo-label'}>
            {'Enter 发送，Shift + Enter 换行'}
          </div>
          <Sender
            data-v-5cccd45a=""
            value={enterValue}
            onValueChange={(next) => setEnterValue(next as typeof enterValue)}
            placeholder={'按 Enter 发送'}
            onSubmit={($event) => {
              handleSubmit('Enter', $event);
            }}
          />
        </section>
        <section data-v-5cccd45a="">
          <div data-v-5cccd45a="" className={'sender-demo-label'}>
            {'Shift + Enter 发送，Enter 换行'}
          </div>
          <Sender
            data-v-5cccd45a=""
            value={shiftEnterValue}
            onValueChange={(next) => setShiftEnterValue(next as typeof shiftEnterValue)}
            submitType={'shiftEnter'}
            placeholder={'按 Shift + Enter 发送'}
            onSubmit={($event) => {
              handleSubmit('Shift + Enter', $event);
            }}
          />
        </section>
        {lastMessage ? (
          <Alert data-v-5cccd45a="" type={'success'}>
            {formatValue(lastMessage)}
          </Alert>
        ) : null}
      </div>
      <style>
        {
          '\n.sender-demo[data-v-5cccd45a] {\n    display: grid;\n    gap: 16px;\n}\n.sender-demo section[data-v-5cccd45a] {\n    display: grid;\n    gap: 8px;\n}\n.sender-demo-label[data-v-5cccd45a] {\n    color: var(--sd-color-text-2);\n    font-size: 13px;\n}\n'
        }
      </style>
    </>
  );
}
