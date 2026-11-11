/** @jsxImportSource react */
import { Copy } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Copy component={'button'} type={'primary'} content={'通过按钮复制'}>
        {' 复制到剪贴板 '}
      </Copy>
    </>
  );
}
