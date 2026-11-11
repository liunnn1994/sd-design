/** @jsxImportSource react */
import { Button, Tooltip } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Tooltip content={'1234'} position={'top'} mini={true}>
        <Button>{'鼠标悬停以显示提示'}</Button>
      </Tooltip>
    </>
  );
}
