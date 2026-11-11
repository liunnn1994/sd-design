/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button } from '@sdata/web-react';

export default function Example() {
  function handleClick() {
    Message.info('这是一条提示消息');
  }

  return (
    <>
      <Button onClick={handleClick}>{'提示消息'}</Button>
    </>
  );
}
