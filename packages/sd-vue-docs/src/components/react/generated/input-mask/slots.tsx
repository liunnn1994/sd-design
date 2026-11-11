/** @jsxImportSource react */
import { InputMask } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <InputMask preset={'semver'} allowClear={true} prefix={<>{'v'}</>} suffix={<>{'稳定版'}</>} />
    </>
  );
}
