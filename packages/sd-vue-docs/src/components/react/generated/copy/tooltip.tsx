/** @jsxImportSource react */
import { Copy } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Copy
        content={'带自定义提示的复制内容'}
        tooltip={'复制链接地址'}
        tooltipProps={{ position: 'right' }}
      >
        {' 自定义提示 '}
      </Copy>
    </>
  );
}
