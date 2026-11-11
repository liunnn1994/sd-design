/** @jsxImportSource react */
import { Button, Popconfirm } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Popconfirm content={'确定要删除吗？'}>
        <Button>{'点击删除'}</Button>
      </Popconfirm>
    </>
  );
}
