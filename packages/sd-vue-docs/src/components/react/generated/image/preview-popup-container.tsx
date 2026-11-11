/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Image } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <div
        id={'image-demo-preview-popup-container'}
        className={
          'sd:relative sd:h-100 sd:w-full sd:overflow-hidden sd:text-center sd:leading-100'
        }
        style={{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` } as CSSProperties}
      >
        <Image
          width={'200'}
          src={'https://picsum.photos/id/10/1000/1000?t=image-demo-16'}
          previewProps={{
            popupContainer: '#image-demo-preview-popup-container',
            closable: false,
          }}
        />
      </div>
    </>
  );
}
