/** @jsxImportSource react */
import { RadioGroup, Space, Tag } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value1, setValue1] = useState('plain 1');
  const plainOptions = ['plain 1', 'plain 2', 'plain 3'];
  const [value2, setValue2] = useState('1');
  const options = [
    { label: 'option 1', value: '1' },
    { label: 'option 2', value: '2' },
    { label: 'option 3', value: '3', disabled: true },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup
          value={value1}
          onValueChange={(next) => setValue1(next as typeof value1)}
          options={plainOptions}
        />
        <RadioGroup
          value={value2}
          onValueChange={(next) => setValue2(next as typeof value2)}
          options={options}
        />
        <RadioGroup
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
