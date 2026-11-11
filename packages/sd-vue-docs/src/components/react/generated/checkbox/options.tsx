/** @jsxImportSource react */
import { CheckboxGroup, Space, Tag } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value1, setValue1] = useState(['普通选项 1']);
  const plainOptions = ['普通选项 1', '普通选项 2', '普通选项 3'];
  const [value2, setValue2] = useState(['1']);
  const options = [
    { label: '选项 1', value: '1' },
    { label: '选项 2', value: '2' },
    { label: '选项 3', value: '3', disabled: true },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <CheckboxGroup
          value={value1}
          onValueChange={(next) => setValue1(next as typeof value1)}
          options={plainOptions}
        />
        <CheckboxGroup
          value={value2}
          onValueChange={(next) => setValue2(next as typeof value2)}
          options={options}
        />
        <CheckboxGroup
          value={value2}
          onValueChange={(next) => setValue2(next as typeof value2)}
          options={options}
          renderLabel={(data) => (
            <>
              <Tag>{formatValue(data.label)}</Tag>
            </>
          )}
        />
      </Space>
    </>
  );
}
