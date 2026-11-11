/** @jsxImportSource react */
import type { AutoCompleteData, AutoCompleteSearchHandler } from '@sdata/web-react';

import { AutoComplete, Radio, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [preset, setPreset] = useState<'default' | 'explicit'>('default');
  const [data, setData] = useState<AutoCompleteData>([]);
  const helperText = (() => {
    return preset === 'default'
      ? 'AutoComplete 现在默认使用固定高度的虚拟行，当你只启用 virtual-list-props 时。'
      : '显式设置 itemSize: 36 在你希望保持下拉配置自描述时非常有用。';
  })();
  const virtualListProps = (() => {
    return preset === 'default' ? {} : { itemSize: 36, buffer: 260 };
  })();
  const createData = (value: string) => {
    if (!value) {
      return [];
    }

    return [...Array(3000)].map((_, index) => `${value}-result-${index}`);
  };
  const handleSearch: AutoCompleteSearchHandler = (value) => {
    setData(createData(value));
  };

  return (
    <>
      <div className={'sd:w-90'}>
        <RadioGroup
          value={preset}
          onValueChange={(next) => setPreset(next as typeof preset)}
          type={'button'}
          className={'sd:mb-3'}
        >
          <Radio value={'default'}>{'默认固定高度'}</Radio>
          <Radio value={'explicit'}>{'显式设置 itemSize'}</Radio>
        </RadioGroup>
        <div className={'sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]'}>
          {formatValue(helperText)}
        </div>
        <AutoComplete
          data={data}
          onSearch={handleSearch}
          className={'sd:w-full'}
          placeholder={'输入 sd 或 design'}
          triggerProps={{ popupStyle: { maxHeight: '220px' } }}
          virtualListProps={virtualListProps}
        />
      </div>
    </>
  );
}
