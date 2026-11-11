/** @jsxImportSource react */
import { ConfigProvider, Pagination, Space } from '@sdata/web-react';

export default function Example() {
  const paginationDefaults = {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal: true,
    showPageSize: true,
  };

  return (
    <>
      <ConfigProvider pagination={paginationDefaults}>
        <Space direction={'vertical'} fill={true}>
          <Pagination total={120} />
          <Pagination total={120} showPageSize={false} showJumper={true} />
        </Space>
      </ConfigProvider>
    </>
  );
}
