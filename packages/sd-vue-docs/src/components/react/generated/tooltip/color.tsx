/** @jsxImportSource react */
import { Button, Space, Tooltip } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Tooltip content={'这里是提示内容'} backgroundColor={'#3491FA'}>
          <Button>{'#3491FA'}</Button>
        </Tooltip>
        <Tooltip content={'这里是提示内容'} backgroundColor={'#165DFF'}>
          <Button>{'#165DFF'}</Button>
        </Tooltip>
        <Tooltip content={'这里是提示内容'} backgroundColor={'#722ED1'}>
          <Button>{'#722ED1'}</Button>
        </Tooltip>
      </Space>
    </>
  );
}
