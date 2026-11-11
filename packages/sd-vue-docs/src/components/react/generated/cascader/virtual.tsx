/** @jsxImportSource react */
import type { CascaderOption } from '@sdata/web-react';

import { Cascader, Radio, RadioGroup } from '@sdata/web-react';
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
      ? '第二级的大量选项使用级联选择器默认的固定行高虚拟滚动。'
      : '需要统一多个级联面板时，可显式设置 itemSize: 36。';
  })();
  const virtualListProps = (() => {
    return preset === 'default' ? {} : { itemSize: 36, buffer: 260 };
  })();
  const createLeafOptions = (prefix: string, count: number): CascaderOption[] => {
    return Array(count)
      .fill(null)
      .map((_, index) => ({
        value: `${prefix}-${index}`,
        label: `${prefix} 选项 ${index}`,
      }));
  };
  const options: CascaderOption[] = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        {
          value: 'chaoyang',
          label: '朝阳区',
          children: createLeafOptions('朝阳区', 1200),
        },
        {
          value: 'haidian',
          label: '海淀区',
          children: createLeafOptions('海淀区', 800),
        },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        {
          value: 'pudong',
          label: '浦东新区',
          children: createLeafOptions('浦东新区', 1500),
        },
        {
          value: 'minhang',
          label: '闵行区',
          children: createLeafOptions('闵行区', 900),
        },
      ],
    },
  ];

  return (
    <>
      <div className={'sd:w-90'}>
        <RadioGroup
          value={preset}
          onValueChange={(next) => setPreset(next as typeof preset)}
          type={'button'}
          className={'sd:mb-3'}
        >
          <Radio value={'default'}>{'默认固定行高'}</Radio>
          <Radio value={'explicit'}>{'显式指定项尺寸'}</Radio>
        </RadioGroup>
        <div className={'sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]'}>
          {formatValue(helperText)}
        </div>
        <Cascader
          options={options}
          className={'sd:w-full'}
          placeholder={'请选择…'}
          allowSearch={true}
          triggerProps={{ popupStyle: { maxHeight: '220px' } }}
          virtualListProps={virtualListProps}
        />
      </div>
    </>
  );
}
