/** @jsxImportSource react */
import { InputMask, Space } from '@sdata/web-react';

export default function Example() {
  const mixedMask = [/\p{Script=Han}/u, /[A-Z]/, '-', /\d/, /\d/] as const;

  return (
    <>
      <Space direction={'vertical'} align={'start'}>
        <InputMask mask={'HH-aa-999'} maskChar={null} placeholder={'中文-ab-123'} />
        <InputMask mask={mixedMask} maskChar={null} placeholder={'中A-12'} />
      </Space>
    </>
  );
}
