/** @jsxImportSource react */
import { InputTag } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <InputTag
        defaultValue={['one', 'two', 'three', 'four']}
        className={'sd:w-95'}
        placeholder={'请输入'}
        maxTagCount={3}
        allowClear={true}
      />
    </>
  );
}
