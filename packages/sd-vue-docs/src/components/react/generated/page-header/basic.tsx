/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Button, PageHeader, Space } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <div
        className={'sd:p-7'}
        style={{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` } as CSSProperties}
      >
        <PageHeader
          style={{ backgroundColor: `var(${getCssVarToken('--color-bg-2')})` } as CSSProperties}
          title={'SD Design'}
          subtitle={'SD Design Vue'}
          extra={
            <>
              <Space>
                <Button>{'取消'}</Button>
                <Button type={'primary'}>{'保存'}</Button>
              </Space>
            </>
          }
        />
      </div>
    </>
  );
}
