/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { QrCode } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  const value = 'https://sd-design.js.org';

  return (
    <>
      <div className={'sd:flex sd:flex-wrap sd:gap-6'}>
        <div className={'sd:flex sd:flex-col sd:items-center sd:gap-3'}>
          <div
            className={'sd:text-sm'}
            style={{ color: `var(${getCssVarToken('--color-text-2')})` } as CSSProperties}
          >
            {'画布'}
          </div>
          <QrCode value={value} type={'canvas'} />
        </div>
        <div className={'sd:flex sd:flex-col sd:items-center sd:gap-3'}>
          <div
            className={'sd:text-sm'}
            style={{ color: `var(${getCssVarToken('--color-text-2')})` } as CSSProperties}
          >
            {'SVG'}
          </div>
          <QrCode value={value} type={'svg'} />
        </div>
      </div>
    </>
  );
}
