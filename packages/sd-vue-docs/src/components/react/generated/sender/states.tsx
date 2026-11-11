/** @jsxImportSource react */
import { Sender } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('第一行\n第二行');

  return (
    <>
      <div data-v-46bea07a="" className={'sender-demo'}>
        <section data-v-46bea07a="">
          <div data-v-46bea07a="" className={'sender-demo-label'}>
            {'自适应高度（2 至 5 行）'}
          </div>
          <Sender
            data-v-46bea07a=""
            value={value}
            onValueChange={(next) => setValue(next as typeof value)}
            autoSize={{ minRows: 2, maxRows: 5 }}
            placeholder={'输入多行内容观察高度变化'}
          />
        </section>
        <section data-v-46bea07a="">
          <div data-v-46bea07a="" className={'sender-demo-label'}>
            {'只读（hover、点击或尝试修改时提示）'}
          </div>
          <Sender
            data-v-46bea07a=""
            readonly={'内容由系统生成，不可编辑'}
            defaultValue={'只读状态允许查看和选择内容，不允许编辑或发送。'}
          />
        </section>
        <section data-v-46bea07a="">
          <div data-v-46bea07a="" className={'sender-demo-label'}>
            {'禁用'}
          </div>
          <Sender
            data-v-46bea07a=""
            disabled={true}
            defaultValue={'禁用状态下所有输入与操作均不可用。'}
          />
        </section>
      </div>
      <style>
        {
          '\n.sender-demo[data-v-46bea07a] {\n    display: grid;\n    gap: 16px;\n}\n.sender-demo section[data-v-46bea07a] {\n    display: grid;\n    gap: 8px;\n}\n.sender-demo-label[data-v-46bea07a] {\n    color: var(--sd-color-text-2);\n    font-size: 13px;\n    font-weight: 500;\n}\n'
        }
      </style>
    </>
  );
}
