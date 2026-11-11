/** @jsxImportSource react */
import { Button, Cascader } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('haidian');
  const options = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        { value: 'chaoyang', label: '朝阳区' },
        { value: 'haidian', label: '海淀区' },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [{ value: 'pudong', label: '浦东新区' }],
    },
  ];

  return (
    <>
      <Cascader
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        options={options}
        renderTrigger={({ displayValue, selectedPaths, popupVisible }) => (
          <>
            <Button type={'primary'}>
              {formatValue(displayValue || '选择地区')}
              {' （'}
              {formatValue(selectedPaths[0]?.length ?? 0)}
              {' 级，'}
              {formatValue(popupVisible ? '收起' : '展开')}
              {'） '}
            </Button>
          </>
        )}
      />
    </>
  );
}
