/** @jsxImportSource react */
import { Button, Select } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('北京');
  const options = ['北京', '上海', '广州', '成都'];

  return (
    <>
      <Select
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        options={options}
        renderTrigger={({ displayValue, selectedOptions, popupVisible }) => (
          <>
            <Button type={'primary'}>
              {' 当前城市：'}
              {formatValue(displayValue || '未选择')}
              {' （'}
              {formatValue(selectedOptions.length)}
              {' 项，'}
              {formatValue(popupVisible ? '收起' : '展开')}
              {'） '}
            </Button>
          </>
        )}
      />
    </>
  );
}
