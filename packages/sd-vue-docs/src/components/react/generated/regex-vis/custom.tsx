/** @jsxImportSource react */
import { Button, RegexVis } from '@sdata/web-react';
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
  function toggleValue() {
    setValue(value ? '' : '(unclosed');
  }

  return (
    <>
      <div data-v-f40eec2d="" className={'regex-vis-demo'}>
        <Button data-v-f40eec2d="" onClick={toggleValue}>
          {formatValue(value ? '查看空状态' : '查看自定义错误态')}
        </Button>
        <RegexVis
          data-v-f40eec2d=""
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          renderEmpty={() => (
            <>
              <span data-v-f40eec2d="" className={'custom-state'}>
                {'选择上方按钮，查看自定义错误反馈'}
              </span>
            </>
          )}
          renderError={({ error }) => (
            <>
              <strong data-v-f40eec2d="">{'无法生成可视图'}</strong>
              <span data-v-f40eec2d="">{formatValue(error.message)}</span>
            </>
          )}
          renderFooter={({ value: currentValue }) => (
            <>
              {' 已输入 '}
              {formatValue(currentValue.length)}
              {' 个字符 '}
            </>
          )}
        />
      </div>
      <style>
        {
          '\n.regex-vis-demo[data-v-f40eec2d] {\n    display: grid;\n    gap: 16px;\n}\n.regex-vis-demo[data-v-f40eec2d] > :first-child {\n    justify-self: start;\n}\n.custom-state[data-v-f40eec2d] {\n    color: var(--sd-color-text-3);\n}\n'
        }
      </style>
    </>
  );
}
