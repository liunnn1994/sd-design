/** @jsxImportSource react */
import { Breadcrumb, BreadcrumbItem, Space } from '@sdata/web-react';
import { IconAt, IconHome } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Breadcrumb>
          <BreadcrumbItem>
            <IconHome />
          </BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbItem>
            <IconHome />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <IconAt />
            {' 渠道 '}
          </BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
      </Space>
    </>
  );
}
