/** @jsxImportSource react */
import {
  type AutoCompleteDropdownReachBottomHandler,
  type AutoCompleteDropdownScrollHandler,
} from '@sdata/web-react';
import { AutoComplete } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [data, setData] = useState([...Array(100)].map((_, index) => `option-${index}`));
  const handleScroll: AutoCompleteDropdownScrollHandler = (ev) => {
    console.log('滚动', ev);
  };
  const handleReachBottom: AutoCompleteDropdownReachBottomHandler = (ev) => {
    console.log('滚动到底部', ev);
  };

  return (
    <>
      <AutoComplete
        data={data}
        className={'sd:w-90'}
        placeholder={'请输入内容'}
        onDropdownScroll={handleScroll}
        onDropdownReachBottom={handleReachBottom}
      />
    </>
  );
}
