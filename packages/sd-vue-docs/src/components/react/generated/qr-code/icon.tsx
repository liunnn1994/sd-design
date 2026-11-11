/** @jsxImportSource react */
import { QrCode } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <QrCode
        value={'https://sd-design.js.org'}
        errorLevel={'H'}
        icon={'https://sd-design.js.org/logo-icon.png'}
      />
    </>
  );
}
