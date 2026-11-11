/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Breadcrumb, BreadcrumbItem, Button, PageHeader, Space } from '@sdata/web-react';
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
          showBack={false}
          breadcrumb={
            <>
              <Breadcrumb>
                <BreadcrumbItem>{'首页'}</BreadcrumbItem>
                <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
                <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
              </Breadcrumb>
            </>
          }
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
