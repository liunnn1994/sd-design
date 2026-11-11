/** @jsxImportSource react */
import type { TableColumnData, TableData } from '@sdata/web-react';

import { Scrollbar, Table } from '@sdata/web-react';

export default function Example() {
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const data: TableData[] = Array.from({ length: 20 }, (_, index) => {
    const key = index + 1;
    return {
      key: String(key),
      name: `用户 ${key}`,
      salary: 20000 + key * 1200,
      address: `${30 + key} Park Road, London`,
      email: `user.${key}@example.com`,
    };
  });

  return (
    <>
      <Scrollbar
        data-v-cdf120ad=""
        type={'track'}
        outerStyle={{ height: '280px' }}
        className={'table-sticky-demo'}
      >
        <Table
          data-v-cdf120ad=""
          columns={columns}
          data={data}
          stickyHeader={true}
          pagination={false}
        />
      </Scrollbar>
      <style>
        {'\n.table-sticky-demo[data-v-cdf120ad] {\n    height: 280px;\n    overflow: auto;\n}\n'}
      </style>
    </>
  );
}
