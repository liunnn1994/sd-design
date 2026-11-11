/** @jsxImportSource react */
import { Button, Popconfirm, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Popconfirm content={'确定要删除吗？'} type={'info'}>
          <Button>{'点击删除'}</Button>
        </Popconfirm>
        <Popconfirm content={'确定要删除吗？'} type={'success'}>
          <Button>{'点击删除'}</Button>
        </Popconfirm>
        <Popconfirm content={'确定要删除吗？'} type={'warning'}>
          <Button>{'点击删除'}</Button>
        </Popconfirm>
        <Popconfirm content={'确定要删除吗？'} type={'error'}>
          <Button>{'点击删除'}</Button>
        </Popconfirm>
      </Space>
    </>
  );
}
