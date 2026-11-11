/** @jsxImportSource react */
import type { ThinkingOrbState } from '@sdata/web-react';

import { Space, ThinkingOrb } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const states: Array<{ label: string; value: ThinkingOrbState }> = [
    { label: '工作', value: 'working' },
    { label: '搜索', value: 'searching' },
    { label: '求解', value: 'solving' },
    { label: '聆听', value: 'listening' },
    { label: '连接', value: 'connecting' },
    { label: '编织', value: 'weaving' },
    { label: '组织', value: 'composing' },
    { label: '思考', value: 'breathing' },
    { label: '塑形', value: 'shaping' },
  ];

  return (
    <>
      <Space data-v-f6b02138="" wrap={true} size={'large'}>
        {states.map((item) => (
          <div data-v-f6b02138="" key={item.value} className={'state-item'}>
            <ThinkingOrb data-v-f6b02138="" state={item.value} />
            <span data-v-f6b02138="">{formatValue(item.label)}</span>
          </div>
        ))}
      </Space>
      <style>
        {
          '\n.state-item[data-v-f6b02138] {\n    display: grid;\n    gap: 8px;\n    justify-items: center;\n    min-width: 72px;\n}\n'
        }
      </style>
    </>
  );
}
