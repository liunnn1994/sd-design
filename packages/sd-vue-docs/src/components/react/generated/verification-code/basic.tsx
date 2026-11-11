/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { VerificationCode } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('654321');
  const onFinish = (value: string) => Message.info(`验证码：${value}`);

  return (
    <>
      <VerificationCode
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        className={'sd:w-75'}
        onFinish={onFinish}
      />
    </>
  );
}
