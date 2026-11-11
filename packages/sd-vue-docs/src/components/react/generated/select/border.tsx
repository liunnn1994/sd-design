/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';

export default function Example() {
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
  const borderOptions = [
    '北京',
    { label: '上海', value: '上海', tagProps: { color: 'red' } },
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '武汉',
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Select
          className={'sd:w-full'}
          placeholder={'请选择…'}
          bordered={false}
          options={options}
        />
        <Select
          defaultValue={['北京', '上海']}
          className={'sd:w-90'}
          placeholder={'请选择…'}
          multiple={true}
          bordered={false}
          options={borderOptions}
        />
      </Space>
    </>
  );
}
