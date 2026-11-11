/** @jsxImportSource react */
import { Alert, Link, Space, Spin, TabPane, Tabs } from '@sdata/web-react';
import { lazy, Suspense } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

const columns = ['名称', '地域', '类型', '负责人', '状态', '数值', '更新时间', '操作'];
const regions = ['华北', '华东', '华南', '西南'];
const types = ['标准型', '增强型', '专属型'];
const owners = ['张伟', '王芳', '李娜', '刘洋'];
const statuses = ['运行中', '已停止', '部署中'];
const rows = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  name: `实例-${String(i + 1).padStart(4, '0')}`,
  region: regions[i % 4],
  type: types[i % 3],
  owner: owners[i % 4],
  status: statuses[i % 3],
  value: (i * 37) % 1000,
  updated: `2026-09-${String((i % 28) + 1).padStart(2, '0')} 12:00`,
}));
function ReuseLoading(props: {}) {
  return (
    <>
      <div className={'sd:flex sd:justify-center sd:py-10'}>
        <Spin />
      </div>
    </>
  );
}
function ReuseReport(props: {}) {
  return (
    <>
      <div className={'sd:mb-3 sd:text-sm sd:text-gray-500'}>
        {' 共 '}
        {formatValue(rows.length)}
        {' 行 × '}
        {formatValue(columns.length)}
        {' 列 —— 切换进入时先显示 loading，不阻塞 tabs 切换。 '}
      </div>
      <div className={'sd:h-80 sd:overflow-y-auto'}>
        <table className={'sd:w-full sd:text-sm'}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={
                    'sd:sticky sd:top-0 sd:bg-white sd:z-10 sd:dark:bg-gray-800 sd:border-b sd:px-3 sd:py-2 sd:text-left sd:font-medium'
                  }
                >
                  {formatValue(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={'sd:border-b sd:border-gray-100'}>
                <td className={'sd:px-3 sd:py-1.5'}>{formatValue(row.name)}</td>
                <td className={'sd:px-3 sd:py-1.5'}>{formatValue(row.region)}</td>
                <td className={'sd:px-3 sd:py-1.5'}>{formatValue(row.type)}</td>
                <td className={'sd:px-3 sd:py-1.5'}>{formatValue(row.owner)}</td>
                <td className={'sd:px-3 sd:py-1.5'}>{formatValue(row.status)}</td>
                <td className={'sd:px-3 sd:py-1.5'}>{formatValue(row.value)}</td>
                <td className={'sd:px-3 sd:py-1.5'}>{formatValue(row.updated)}</td>
                <td className={'sd:px-3 sd:py-1.5'}>
                  <Space size={'mini'}>
                    <Link>{'查看'}</Link>
                    <Link>{'编辑'}</Link>
                  </Space>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
const AsyncReport = lazy(
  () =>
    new Promise<{ default: typeof ReuseReport }>((resolve) =>
      setTimeout(() => resolve({ default: ReuseReport }), 1000),
    ),
);
export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Alert>
          {
            ' 重型面板（大表格、图表等）拆成异步组件：切换到重型面板时先显示 loading 占位，内容就绪后替换，切换交互不被阻塞。 '
          }
        </Alert>
        <Tabs defaultActiveKey={'1'} lazyLoad={true}>
          <TabPane key={'1'} title={'概览'}>
            {' 轻面板：切换零开销。 '}
          </TabPane>
          <TabPane key={'2'} title={'重型报表（异步 + loading）'}>
            <Suspense fallback={<ReuseLoading />}>
              <AsyncReport />
            </Suspense>
          </TabPane>
        </Tabs>
      </Space>
    </>
  );
}
