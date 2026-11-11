/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';

export default function Example() {
  const groupOptions = [
    {
      isGroup: true,
      label: '分组 1',
      options: ['北京', '上海'],
    },
    {
      isGroup: true,
      label: '分组 2',
      options: ['广州', { label: '禁用', value: '禁用', disabled: true }, '深圳'],
    },
    {
      isGroup: true,
      label: '分组 3',
      options: ['成都', '武汉'],
    },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Select className={'sd:w-80'} placeholder={'请选择…'} options={groupOptions} />
        <Select
          className={'sd:w-80'}
          placeholder={'请选择…'}
          multiple={true}
          options={groupOptions}
        />
      </Space>
    </>
  );
}
