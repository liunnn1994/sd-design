/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Button, QrCode, Spin } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  const value = 'https://sd-design.js.org';

  return (
    <>
      <div className={'sd:flex sd:flex-wrap sd:gap-6'}>
        <QrCode
          value={value}
          status={'loading'}
          renderStatus={() => (
            <>
              <div className={'sd:flex sd:flex-col sd:items-center sd:gap-2'}>
                <Spin dot={true} size={20} />
                <span className={'sd:text-sm'}>{'正在生成中'}</span>
              </div>
            </>
          )}
        />
        <QrCode
          value={value}
          status={'expired'}
          renderStatus={({ onRefresh }) => (
            <>
              <div className={'sd:flex sd:flex-col sd:items-center sd:gap-2'}>
                <span
                  className={'sd:text-sm'}
                  style={{ color: `var(${getCssVarToken('--color-danger-6')})` } as CSSProperties}
                >
                  {'登录码已失效'}
                </span>
                <Button type={'text'} size={'small'} onClick={onRefresh}>
                  {'立即刷新'}
                </Button>
              </div>
            </>
          )}
        />
      </div>
    </>
  );
}
