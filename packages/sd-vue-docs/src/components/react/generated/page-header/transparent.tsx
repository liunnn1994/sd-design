/** @jsxImportSource react */
import { Breadcrumb, BreadcrumbItem, Button, PageHeader, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div
        className={
          'sd:bg-[radial-gradient(var(--color-fill-3)_1px,rgba(0,0,0,0)_1px)] sd:p-7 sd:[background-size:16px_16px]'
        }
      >
        <PageHeader
          title={'SD Design'}
          subtitle={'SD Design Vue'}
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
