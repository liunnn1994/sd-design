/** @jsxImportSource react */
import { Breadcrumb, Link, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [routes, setRoutes] = useState([
    {
      path: '/',
      label: '首页',
    },
    {
      path: '/channel',
      label: '渠道',
    },
    {
      path: '/news',
      label: '新闻',
    },
  ]);

  return (
    <>
      <Space direction={'vertical'}>
        <Breadcrumb routes={routes} />
        <Breadcrumb
          routes={routes}
          itemRender={({ route, paths }) => (
            <>
              <Link href={paths.join('/')}>{formatValue(route.label)}</Link>
            </>
          )}
        />
      </Space>
    </>
  );
}
