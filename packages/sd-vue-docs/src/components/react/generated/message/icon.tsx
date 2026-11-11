/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button } from '@sdata/web-react';
import { IconFaceSmileFill } from '@sdata/web-react/icon';
import { createElement } from 'react';

export default function Example() {
  function handleClick() {
    Message.info({
      content: '这是一条提示消息！',
      icon: () => createElement(IconFaceSmileFill, null),
    });
  }

  return (
    <>
      <Button onClick={handleClick}>{'提示消息'}</Button>
    </>
  );
}
