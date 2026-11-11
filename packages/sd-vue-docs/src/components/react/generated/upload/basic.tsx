/** @jsxImportSource react */
import { Space, Upload } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} className={'sd:w-full'}>
        <Upload action={'/'} />
        <Upload action={'/'} disabled={true} className={'sd:mt-10'} />
      </Space>
    </>
  );
}
