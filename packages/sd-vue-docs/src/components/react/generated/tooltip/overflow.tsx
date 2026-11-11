/** @jsxImportSource react */
import { Button, Tooltip } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Tooltip content={'这是一段较长的提示内容，用于演示窗口边界避让和内部滚动。'.repeat(100)}>
        <Button>{'查看长内容提示'}</Button>
      </Tooltip>
    </>
  );
}
