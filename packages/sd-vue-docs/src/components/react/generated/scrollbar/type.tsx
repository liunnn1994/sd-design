/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Scrollbar } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <Scrollbar className={'sd:h-50 sd:overflow-auto'}>
        <div
          className={'sd:w-500 sd:h-500'}
          style={
            {
              backgroundColor: `var(${getCssVarToken('--color-primary-light-4')})`,
            } as CSSProperties
          }
        >
          {'内容'}
        </div>
      </Scrollbar>
    </>
  );
}
