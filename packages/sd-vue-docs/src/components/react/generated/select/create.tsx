/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';

export default function Example() {
  const options = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Select
          className={'sd:w-80'}
          placeholder={'请选择…'}
          allowCreate={true}
          options={options}
        />
        <Select
          className={'sd:w-80'}
          placeholder={'请选择…'}
          multiple={true}
          allowCreate={true}
          options={options}
        />
      </Space>
    </>
  );
}
