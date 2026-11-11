/** @jsxImportSource react */
import { Input, QrCode } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [text, setText] = useState('https://sd-design.js.org');

  return (
    <>
      <div className={'sd:flex sd:flex-col sd:items-center sd:gap-4'}>
        <QrCode value={text || '-'} />
        <Input
          value={text}
          onValueChange={(next) => setText(next as typeof text)}
          className={'sd:w-80'}
          placeholder={'请输入二维码内容'}
        />
      </div>
    </>
  );
}
