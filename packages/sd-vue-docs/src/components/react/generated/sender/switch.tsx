/** @jsxImportSource react */
import { Alert, Sender, SenderSwitch } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('介绍一下 Vue 3 的响应式原理');
  const [submitted, setSubmitted] = useState('');
  const [deepThinking, setDeepThinking] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  function handleSubmit(text: string) {
    setSubmitted(
      `${deepThinking ? '深度思考' : '快速回答'} · ${webSearch ? '联网搜索' : '离线回答'}：${text}`,
    );
  }

  return (
    <>
      <div data-v-c7ef67d6="" className={'sender-demo'}>
        <Sender
          data-v-c7ef67d6=""
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          placeholder={'输入问题，选择回答模式'}
          onSubmit={handleSubmit}
          slots={{
            footer: () => (
              <>
                <div data-v-c7ef67d6="" className={'sender-demo-switches'}>
                  <SenderSwitch
                    data-v-c7ef67d6=""
                    value={deepThinking}
                    onValueChange={(next) => setDeepThinking(next as typeof deepThinking)}
                    slots={{ checked: () => <>{'深度思考'}</>, unchecked: () => <>{'快速回答'}</> }}
                  />
                  <SenderSwitch
                    data-v-c7ef67d6=""
                    value={webSearch}
                    onValueChange={(next) => setWebSearch(next as typeof webSearch)}
                    slots={{ checked: () => <>{'已联网'}</>, unchecked: () => <>{'联网搜索'}</> }}
                  />
                </div>
              </>
            ),
          }}
        />
        {submitted ? (
          <Alert data-v-c7ef67d6="" type={'info'}>
            {formatValue(submitted)}
          </Alert>
        ) : null}
      </div>
      <style>
        {
          '\n.sender-demo[data-v-c7ef67d6] {\n    display: grid;\n    gap: 12px;\n}\n.sender-demo-switches[data-v-c7ef67d6] {\n    display: flex;\n    gap: 8px;\n}\n'
        }
      </style>
    </>
  );
}
