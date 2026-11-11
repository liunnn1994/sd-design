/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const cityOptions = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
  const boolOptions = [
    { value: true, label: '是' },
    { value: false, label: '否' },
  ];
  const longOptions = [
    '北京—北京—北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
  ];
  const [value, setValue] = useState<ComponentProps<typeof Select>['value'] | undefined>(undefined);
  const data = [
    {
      value: 'beijing',
      label: '北京',
      other: 'extra',
    },
    {
      value: 'shanghai',
      label: '上海',
      other: 'extra',
    },
    {
      value: 'guangzhou',
      label: '广州',
      other: 'extra',
    },
    {
      value: 'chengdu',
      label: '成都',
      other: 'extra',
    },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Select className={'sd:w-80'} placeholder={'请选择…'} options={cityOptions} />
        <Select className={'sd:w-80'} placeholder={'请选择…'} options={boolOptions} />
        <Select
          defaultValue={'北京'}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          disabled={true}
          options={cityOptions}
        />
        <Select
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          options={data}
        />
        <div>
          {'选中值： '}
          {formatValue(value)}
        </div>
        <Select
          className={'sd:w-40'}
          placeholder={'选择框'}
          triggerProps={{ autoFitPopupMinWidth: true }}
          options={longOptions}
        />
      </Space>
    </>
  );
}
