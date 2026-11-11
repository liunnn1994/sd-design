/** @jsxImportSource react */
import { Space, VerificationCode } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <VerificationCode
          defaultValue={'123456'}
          className={'sd:w-75'}
          formatter={(inputValue: string) => (/^\d*$/.test(inputValue) ? inputValue : false)}
        />
        <VerificationCode
          defaultValue={'abcdef'}
          className={'sd:w-75'}
          formatter={(inputValue: string) =>
            /^[a-zA-Z]*$/.test(inputValue) ? inputValue.toUpperCase() : ''
          }
        />
      </Space>
    </>
  );
}
