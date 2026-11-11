/** @jsxImportSource react */
import { Button, Popover } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Popover
        title={'标题'}
        content={
          <>
            <p>{'这里是文本内容'}</p>
            <p>{'这里是文本内容'}</p>
          </>
        }
      >
        <Button>{'悬停'}</Button>
      </Popover>
    </>
  );
}
