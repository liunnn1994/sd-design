/** @jsxImportSource react */
import { InputNumber } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <InputNumber
        placeholder={'请输入'}
        defaultValue={500}
        mode={'button'}
        className={'input-demo sd:w-80'}
      />
    </>
  );
}
