/** @jsxImportSource react */
import { Button, Sender, SenderHeader } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState('');

  return (
    <>
      <div data-v-64989ae7="" className={'sender-demo'}>
        <Button
          data-v-64989ae7=""
          type={'outline'}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {formatValue(open ? '收起引用' : '展开引用')}
        </Button>
        <Sender
          data-v-64989ae7=""
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          placeholder={'针对引用内容提问'}
          slots={{
            header: () => (
              <>
                <SenderHeader
                  data-v-64989ae7=""
                  open={open}
                  onOpenChange={(next) => setOpen(next as typeof open)}
                  title={'引用内容'}
                >
                  {' Ant Design X Sender 的头部面板支持平滑展开和收起。 '}
                </SenderHeader>
              </>
            ),
          }}
        />
      </div>
      <style>
        {
          '\n.sender-demo[data-v-64989ae7] {\n    display: grid;\n    gap: 12px;\n}\n.sender-demo > button[data-v-64989ae7] {\n    justify-self: start;\n}\n'
        }
      </style>
    </>
  );
}
