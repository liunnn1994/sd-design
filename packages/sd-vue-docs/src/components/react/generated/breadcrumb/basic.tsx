/** @jsxImportSource react */
import { Breadcrumb, BreadcrumbItem } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem>{'首页'}</BreadcrumbItem>
        <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
        <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
      </Breadcrumb>
    </>
  );
}
