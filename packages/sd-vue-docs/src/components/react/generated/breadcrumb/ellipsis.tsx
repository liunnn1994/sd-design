/** @jsxImportSource react */
import { Breadcrumb, BreadcrumbItem, Space, Tooltip } from '@sdata/web-react';
import { IconMore } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Breadcrumb maxCount={3}>
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'子首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'所有渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
          <BreadcrumbItem>{'岗位'}</BreadcrumbItem>
        </Breadcrumb>
        <Breadcrumb
          maxCount={3}
          moreIcon={
            <>
              <Tooltip content={'更多路由 a/b/c'}>
                <IconMore />
              </Tooltip>
            </>
          }
        >
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'子首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'所有渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
          <BreadcrumbItem>{'岗位'}</BreadcrumbItem>
        </Breadcrumb>
      </Space>
    </>
  );
}
