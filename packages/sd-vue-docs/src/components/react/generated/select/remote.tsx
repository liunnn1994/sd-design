/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [options, setOptions] = useState(['选项 1', '选项 2', '选项 3']);
  const [loading, setLoading] = useState(false);
  const handleSearch = (value: string) => {
    if (value) {
      setLoading(true);
      window.setTimeout(() => {
        setOptions([`${value}-Option1`, `${value}-Option2`, `${value}-Option3`]);
        setLoading(false);
      }, 2000);
    } else {
      setOptions([]);
    }
  };

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <div>{'在搜索选项后显示已选项'}</div>
        <Select
          className={'sd:w-80'}
          options={options}
          loading={loading}
          placeholder={'请选择…'}
          multiple={true}
          onSearch={handleSearch}
          filterOption={false}
        />
        <div>{'在搜索选项后隐藏已选项'}</div>
        <Select
          options={options}
          className={'sd:w-80'}
          loading={loading}
          placeholder={'请选择…'}
          multiple={true}
          onSearch={handleSearch}
          filterOption={false}
          showExtraOptions={false}
        />
      </Space>
    </>
  );
}
