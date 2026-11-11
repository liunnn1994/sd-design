/** @jsxImportSource react */
import { Copy } from '@sdata/web-react';
import { IconCheckCircle } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Copy
        content={'自定义图标复制内容'}
        icon={
          <>
            <IconCheckCircle />
          </>
        }
      >
        {' 自定义图标 '}
      </Copy>
    </>
  );
}
