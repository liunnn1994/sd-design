/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { VerificationCode } from '@sdata/web-react';

export default function Example() {
  const onFinish = (value: string) => Message.info(`验证码：${value}`);

  return (
    <>
      <VerificationCode
        defaultValue={'123'}
        className={'sd:w-75'}
        masked={true}
        onFinish={onFinish}
      />
    </>
  );
}
