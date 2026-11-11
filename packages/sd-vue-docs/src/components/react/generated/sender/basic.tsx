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
  const [value, setValue] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  function handleSubmit(message: string) {
    setLastMessage(message);
    setValue('');
  }

  return (
    <>
      <div data-v-ace7ef05="" className={'sender-demo'}>
        <Sender
          data-v-ace7ef05=""
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          placeholder={'输入消息，按 Enter 发送'}
          onSubmit={handleSubmit}
        />
        {lastMessage ? (
          <Alert data-v-ace7ef05="" type={'success'}>
            {' 最近发送：'}
            {formatValue(lastMessage)}
          </Alert>
        ) : null}
      </div>
      <style>{'\n.sender-demo[data-v-ace7ef05] {\n    display: grid;\n    gap: 12px;\n}\n'}</style>
    </>
  );
}
