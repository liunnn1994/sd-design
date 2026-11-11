/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Button, Result, Typography, TypographyParagraph } from '@sdata/web-react';
import { IconFaceFrownFill } from '@sdata/web-react/icon';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <Result
        status={'error'}
        title={'无法连接网络 '}
        icon={
          <>
            <IconFaceFrownFill />
          </>
        }
        subtitle={<>{' DNS_PROBE_FINISHED_NO_INTERNET '}</>}
        extra={
          <>
            <Button type={'primary'}>{'刷新'}</Button>
          </>
        }
      >
        <Typography
          className={'sd:p-6'}
          style={{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` } as CSSProperties}
        >
          <TypographyParagraph>{'请尝试：'}</TypographyParagraph>
          <ul>
            <li>{' 检查网线、调制解调器和路由器 '}</li>
            <li>{' 重新连接 Wi-Fi '}</li>
          </ul>
        </Typography>
      </Result>
    </>
  );
}
