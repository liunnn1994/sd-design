/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { VerificationCode } from '@sdata/web-react';
import { createElement } from 'react';

export default function Example() {
  const handleFinish = (value: string) => Message.info(`验证码：${value}`);

  return (
    <>
      <VerificationCode
        className={'sd:w-100'}
        length={9}
        separator={(index) =>
          (index + 1) % 3 || index > 7 ? createElement('span', null) : createElement('span', '-')
        }
        onFinish={handleFinish}
      />
    </>
  );
}
