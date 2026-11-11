/** @jsxImportSource react */
import type { SelectFallbackOption } from '@sdata/web-react';

import { Select, Space } from '@sdata/web-react';

export default function Example() {
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
  const allOptions = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];
  const fallback: SelectFallbackOption = (value) => {
    return {
      value,
      label: `++${value}++`,
    };
  };

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Select
          defaultValue={'Shanxi'}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          fallbackOption={fallback}
          options={options}
        />
        <Select
          defaultValue={'Shanxi'}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          fallbackOption={fallback}
          showExtraOptions={false}
          options={options}
        />
        <Select
          defaultValue={['Shanxi', 'Nanjing', 'Hangzhou']}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          multiple={true}
          fallbackOption={fallback}
          options={allOptions}
        />
      </Space>
    </>
  );
}
