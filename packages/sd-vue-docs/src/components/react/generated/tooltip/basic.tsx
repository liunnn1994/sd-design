/** @jsxImportSource react */
import { Button, Space, Tooltip } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Tooltip content={'这里是提示内容'}>
          <Button>{'鼠标悬停以显示提示'}</Button>
        </Tooltip>
        <Tooltip content={'这是一段两行的提示内容。这是一段两行的提示内容。'}>
          <Button>{'鼠标悬停以显示提示'}</Button>
        </Tooltip>
      </Space>
    </>
  );
}
