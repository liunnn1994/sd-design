/** @jsxImportSource react */
import { Button, Sender } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('请总结今天的会议记录');
  const [loading, setLoading] = useState(false);
  function handleSubmit() {
    setLoading(true);
  }

  return (
    <>
      <Sender
        data-v-e8e5853a=""
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        loading={loading}
        suffixPlacement={'footer'}
        onSubmit={handleSubmit}
        onCancel={() => {
          setLoading(false);
        }}
        slots={{
          prefix: () => (
            <>
              <Button data-v-e8e5853a="" type={'text'} size={'small'}>
                {'附件'}
              </Button>
            </>
          ),
          suffix: ({ actions }) => (
            <>
              <div data-v-e8e5853a="" className={'custom-actions'}>
                {value ? (
                  <Button
                    data-v-e8e5853a=""
                    type={'text'}
                    size={'small'}
                    disabled={actions.clearDisabled}
                    onClick={actions.clear}
                  >
                    {' 清空 '}
                  </Button>
                ) : null}
                <Button
                  data-v-e8e5853a=""
                  type={loading ? 'outline' : 'primary'}
                  size={'small'}
                  disabled={loading ? actions.cancelDisabled : actions.submitDisabled}
                  onClick={() => {
                    loading ? actions.cancel() : actions.send();
                  }}
                >
                  {formatValue(loading ? '停止' : '发送')}
                </Button>
              </div>
            </>
          ),
          footer: () => (
            <>
              <span data-v-e8e5853a="" className={'footer-tip'}>
                {'内容由 AI 生成，请核对重要信息。'}
              </span>
            </>
          ),
        }}
      />
      <style>
        {
          '\n.custom-actions[data-v-e8e5853a] {\n    display: flex;\n    gap: 8px;\n}\n.footer-tip[data-v-e8e5853a] {\n    color: var(--sd-color-text-3);\n    font-size: 12px;\n}\n'
        }
      </style>
    </>
  );
}
