/** @jsxImportSource react */
import type {
  SenderInstance,
  SenderResolvedSlotConfig,
  SenderSkill,
  SenderSlotConfig,
} from '@sdata/web-react';

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
  const skill: SenderSkill = {
    title: '旅行助手',
    value: 'travel',
    closable: true,
  };
  const slotConfig: SenderSlotConfig[] = [
    { type: 'text', value: '帮我规划 ' },
    {
      type: 'select',
      key: 'city',
      props: {
        options: ['杭州', '上海', '北京'],
        defaultValue: '杭州',
        placeholder: '目的地',
      },
    },
    { type: 'text', value: ' 的 ' },
    {
      type: 'input',
      key: 'days',
      props: { defaultValue: '3 天', placeholder: '行程天数' },
    },
    {
      type: 'content',
      key: 'preference',
      props: { defaultValue: '亲子游', placeholder: '偏好' },
      formatResult: (value) => `，偏好 ${String(value)}`,
    },
  ];
  function handleChange(
    value: string,
    _event: Event | undefined,
    _config: SenderResolvedSlotConfig[],
    _skill: SenderSkill | undefined,
  ) {
    setCurrentValue(value);
  }
  function handleSubmit(value: string) {
    setCurrentValue(value);
  }
  function insertTone() {
    senderRef.current?.insert(
      [{ type: 'tag', key: `tone-${Date.now()}`, props: { label: '简洁', value: '，简洁地' } }],
      'end',
    );
  }

  return (
    <>
      <div data-v-e7d1772c="" className={'sender-demo'}>
        <Sender
          data-v-e7d1772c=""
          ref={senderRef}
          slotConfig={slotConfig}
          skill={skill}
          placeholder={'补充查询条件'}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
        <div data-v-e7d1772c="" className={'sender-demo-actions'}>
          <Button data-v-e7d1772c="" size={'small'} onClick={insertTone}>
            {'插入语气'}
          </Button>
          <Button
            data-v-e7d1772c=""
            size={'small'}
            type={'text'}
            onClick={() => {
              senderRef.current?.clear();
            }}
          >
            {'清空'}
          </Button>
        </div>
        <Alert data-v-e7d1772c="" type={'info'}>
          {' 当前结果：'}
          {formatValue(currentValue || '暂无内容')}
        </Alert>
      </div>
      <style>
        {
          '\n.sender-demo[data-v-e7d1772c] {\n    display: grid;\n    gap: 12px;\n}\n.sender-demo-actions[data-v-e7d1772c] {\n    display: flex;\n    gap: 8px;\n}\n'
        }
      </style>
    </>
  );
}
