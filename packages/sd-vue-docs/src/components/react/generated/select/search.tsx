/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';
import { useState } from 'react';

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
  const [remoteOptions, setRemoteOptions] = useState(['选项 1', '选项 2', '选项 3']);
  const [loading, setLoading] = useState(false);
  const handleSearch = (value: string) => {
    if (value) {
      setLoading(true);
      window.setTimeout(() => {
        setRemoteOptions([`${value}-Option1`, `${value}-Option2`, `${value}-Option3`]);
        setLoading(false);
      }, 2000);
    } else {
      setRemoteOptions([]);
    }
  };

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Select
          className={'sd:w-80'}
          placeholder={'请选择…'}
          allowSearch={true}
          options={options}
        />
        <Select
          className={'sd:w-80'}
          placeholder={'请选择…'}
          allowSearch={{ retainInputValue: true }}
          options={options}
        />
        <Select
          options={remoteOptions}
          className={'sd:w-80'}
          loading={loading}
          placeholder={'请选择…'}
          multiple={true}
          onSearch={handleSearch}
        />
      </Space>
    </>
  );
}
