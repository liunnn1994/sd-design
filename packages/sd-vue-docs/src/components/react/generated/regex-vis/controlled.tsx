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
  const patterns = [
    { label: '邮箱', value: '^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$' },
    { label: '日期', value: '^(\\d{4})-(\\d{2})-(\\d{2})$' },
    { label: '错误示例', value: '(unclosed' },
  ];
  const [value, setValue] = useState(patterns[0].value);

  return (
    <>
      <div data-v-cae163c1="" className={'regex-vis-demo'}>
        <div data-v-cae163c1="" className={'regex-vis-demo-actions'}>
          {patterns.map((item) => (
            <Button
              data-v-cae163c1=""
              key={item.label}
              type={value === item.value ? 'primary' : 'secondary'}
              onClick={() => {
                setValue(item.value);
              }}
            >
              {formatValue(item.label)}
            </Button>
          ))}
        </div>
        <RegexVis
          data-v-cae163c1=""
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
        />
      </div>
      <style>
        {
          '\n.regex-vis-demo[data-v-cae163c1] {\n    display: grid;\n    gap: 16px;\n}\n.regex-vis-demo-actions[data-v-cae163c1] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n}\n'
        }
      </style>
    </>
  );
}
