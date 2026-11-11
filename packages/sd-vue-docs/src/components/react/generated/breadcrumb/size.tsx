/** @jsxImportSource react */
import { Breadcrumb, BreadcrumbItem, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Breadcrumb>
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
        <Breadcrumb className={'sd:text-xs'}>
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
      </Space>
    </>
  );
}
