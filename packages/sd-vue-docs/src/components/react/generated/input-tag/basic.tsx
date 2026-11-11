/** @jsxImportSource react */
import { InputTag } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <InputTag
        defaultValue={['test']}
        className={'sd:w-80'}
        placeholder={'请输入'}
        allowClear={true}
      />
    </>
  );
}
