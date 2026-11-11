/** @jsxImportSource react */
import { Radio, RadioGroup, Select } from '@sdata/web-react';
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
  const helperText = (() => {
    return preset === 'default'
      ? '使用空对象 `{}` 可展示 Select 控件的新默认固定高度下拉菜单行为。'
      : '使用 itemSize: 36 可显式设置固定高度模式，并增加渲染缓冲区。';
  })();
  const virtualListProps = (() => {
    return preset === 'default' ? {} : { itemSize: 36, buffer: 260 };
  })();
  const options = Array(1500)
    .fill(null)
    .map((_, index) => ({
      value: `option-${index}`,
      label: `选项 ${index} · 虚拟行 ${index % 9}`,
    }));

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
        <Select
          className={'sd:w-full'}
          options={options}
          placeholder={'请选择…'}
          triggerProps={{ popupStyle: { maxHeight: '220px' } }}
          virtualListProps={virtualListProps}
        />
      </div>
    </>
  );
}
