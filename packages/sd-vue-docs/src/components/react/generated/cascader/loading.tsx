/** @jsxImportSource react */
import { Cascader } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Cascader options={[]} className={'sd:w-80'} placeholder={'请选择…'} loading={true} />
    </>
  );
}
