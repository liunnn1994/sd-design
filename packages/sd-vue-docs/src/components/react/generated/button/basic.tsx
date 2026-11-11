/** @jsxImportSource react */
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Button type={'primary'}>{'主要'}</Button>
        <Button>{'次要'}</Button>
        <Button type={'dashed'}>{'虚线'}</Button>
        <Button type={'outline'}>{'描边'}</Button>
        <Button type={'text'}>{'文本'}</Button>
      </Space>
    </>
  );
}
