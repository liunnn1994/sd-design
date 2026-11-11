/** @jsxImportSource react */
import { Breadcrumb, BreadcrumbItem, Button, Doption, Dsubmenu, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [routes, setRoutes] = useState([
    {
      path: '/',
      label: '首页',
    },
    {
      path: '/channel',
      label: '渠道',
      children: [
        {
          path: '/users',
          label: '用户',
        },
        {
          path: '/permission',
          label: '权限',
        },
      ],
    },
    {
      path: '/news',
      label: '新闻',
    },
  ]);
  const [droplist, setDroplist] = useState([
    {
      path: '/goods',
      label: '商品',
    },
    {
      path: '/wallet',
      label: '钱包',
    },
  ]);

  return (
    <>
      <Space direction={'vertical'}>
        <Breadcrumb routes={routes} />
        <Breadcrumb>
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem droplist={droplist}>{' 渠道 '}</BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbItem>{'首页'}</BreadcrumbItem>
          <BreadcrumbItem
            dropdownContent={
              <>
                <Doption>{'选项 1'}</Doption>
                <Dsubmenu
                  value={'option-1'}
                  content={
                    <>
                      <Doption>{'选项 2-1'}</Doption>
                      <Doption>{'选项 2-2'}</Doption>
                      <Doption>{'选项 2-3'}</Doption>
                    </>
                  }
                  footer={
                    <>
                      <div className={'sd:p-1.5 sd:text-center'}>
                        <Button>{'点击'}</Button>
                      </div>
                    </>
                  }
                >
                  {'选项 2'}
                </Dsubmenu>
                <Doption>{'选项 3'}</Doption>
              </>
            }
          >
            {' 渠道 '}
          </BreadcrumbItem>
          <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
        </Breadcrumb>
      </Space>
    </>
  );
}
