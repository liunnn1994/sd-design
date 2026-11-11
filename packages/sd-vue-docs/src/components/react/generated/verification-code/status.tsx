/** @jsxImportSource react */
import { Space, TypographyText, VerificationCode } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Space>
          <TypographyText className={'sd:w-20'}>{'禁用：'}</TypographyText>
          <VerificationCode defaultValue={'123456'} className={'sd:w-75'} disabled={true} />
        </Space>
        <Space>
          <TypographyText className={'sd:w-20'}>{'只读：'}</TypographyText>
          <VerificationCode defaultValue={'123456'} className={'sd:w-75'} readonly={true} />
        </Space>
        <Space>
          <TypographyText className={'sd:w-20'}>{'错误：'}</TypographyText>
          <VerificationCode defaultValue={'123456'} className={'sd:w-75'} error={true} />
        </Space>
      </Space>
    </>
  );
}
