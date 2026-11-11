/** @jsxImportSource react */
import { Breadcrumb, BreadcrumbItem, Space } from '@sdata/web-react';
import { IconRight } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Breadcrumb
          separator={
            <>
              <IconRight />
            </>
          }
        >
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
        <Breadcrumb separator={'~'}>
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
        <Breadcrumb
          separator={
            <>
              <IconRight />
            </>
          }
        >
          <BreadcrumbItem separator={'->'}>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
      </Space>
    </>
  );
}
