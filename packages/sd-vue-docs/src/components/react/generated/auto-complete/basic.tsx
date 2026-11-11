/** @jsxImportSource react */
import type { AutoCompleteData, AutoCompleteSearchHandler } from '@sdata/web-react';

import { AutoComplete } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [data, setData] = useState<AutoCompleteData>([]);
  const handleSearch: AutoCompleteSearchHandler = (value) => {
    if (value) {
      setData([...Array(5)].map((_, index) => `${value}-${index}`));
      console.log(data);
    } else {
      setData([]);
    }
  };

  return (
    <>
      <AutoComplete
        data={data}
        onSearch={handleSearch}
        className={'sd:w-90'}
        placeholder={'请输入内容'}
      />
    </>
  );
}
