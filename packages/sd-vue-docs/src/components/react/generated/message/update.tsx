/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [index, setIndex] = useState(0);
  function handleClick() {
    Message.info({
      id: 'myInfo',
      content: `提示消息 ${setIndex((previous) => previous + 1)}`,
      duration: 2000,
    });
  }

  return (
    <>
      <Button onClick={handleClick}>{'更新提示消息'}</Button>
    </>
  );
}
