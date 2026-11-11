/** @jsxImportSource react */
import type { AutoCompleteData, AutoCompleteSearchHandler } from '@sdata/web-react';

import { AutoComplete, Space } from '@sdata/web-react';
import { IconInfoCircle, IconUser } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [data, setData] = useState<AutoCompleteData>([]);
  const handleSearch: AutoCompleteSearchHandler = (value) => {
    if (value) {
      setData([...Array(5)].map((_, index) => `${value}-${index}`));
    } else {
      setData([]);
    }
  };

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <AutoComplete
          data={data}
          onSearch={handleSearch}
          className={'sd:w-90'}
          placeholder={'请输入内容'}
          prefix={
            <>
              <IconUser />
            </>
          }
        />
        <AutoComplete
          data={data}
          onSearch={handleSearch}
          className={'sd:w-90'}
          placeholder={'请输入内容'}
          allowClear={true}
          suffix={
            <>
              <IconInfoCircle />
            </>
          }
        />
      </Space>
    </>
  );
}
