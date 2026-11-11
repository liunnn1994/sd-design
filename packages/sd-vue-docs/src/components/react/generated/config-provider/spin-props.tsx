/** @jsxImportSource react */
import { Button, Card, ConfigProvider, Space, Spin, Table } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [loading, setLoading] = useState(false);
  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '角色', dataIndex: 'role' },
  ];
  const data = [{ key: '1', name: '张三', role: '管理员' }];

  return (
    <>
      <ConfigProvider
        spinProps={{ delay: true }}
        tableSpinProps={{ delay: 800, tip: '表格加载中' }}
      >
        <Space direction={'vertical'} fill={true}>
          <Button
            onClick={() => {
              setLoading(!loading);
            }}
          >
            {formatValue(loading ? '结束加载' : '开始加载')}
          </Button>
          <Spin loading={loading}>
            <Card title={'通用 Spin'}>{'继承 400ms 延迟。'}</Card>
          </Spin>
          <Table columns={columns} data={data} loading={loading} pagination={false} />
        </Space>
      </ConfigProvider>
    </>
  );
}
