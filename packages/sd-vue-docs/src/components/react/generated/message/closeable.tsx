/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button } from '@sdata/web-react';

export default function Example() {
  function handleClick() {
    Message.info({
      content: '这是一条提示消息！',
      closable: true,
    });
  }

  return (
    <>
      <Button onClick={handleClick}>{'可关闭的消息'}</Button>
    </>
  );
}
