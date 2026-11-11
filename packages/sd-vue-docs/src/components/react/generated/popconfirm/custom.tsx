/** @jsxImportSource react */
import { Button, Popconfirm } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Popconfirm content={'确定要放弃草稿吗？'} okText={'放弃'} cancelText={'No'}>
        <Button>{'放弃'}</Button>
      </Popconfirm>
    </>
  );
}
