/** @jsxImportSource react */
import { AutoComplete } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [data, setData] = useState(['北京', '上海', '成都', '武汉']);

  return (
    <>
      <AutoComplete data={data} className={'sd:w-90'} placeholder={'请输入内容'} strict={true} />
    </>
  );
}
