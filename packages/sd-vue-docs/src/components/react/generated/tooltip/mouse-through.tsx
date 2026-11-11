/** @jsxImportSource react */
import { Button, Space, Tooltip } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Tooltip content={'鼠标会穿过气泡，离开按钮后自动隐藏'}>
          <Button>{'默认穿透'}</Button>
        </Tooltip>
        <Tooltip mouseThrough={false} content={'鼠标可以移入气泡并保持显示'}>
          <Button>{'关闭穿透'}</Button>
        </Tooltip>
      </Space>
    </>
  );
}
