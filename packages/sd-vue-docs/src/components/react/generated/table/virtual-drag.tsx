/** @jsxImportSource react */
import type { TableColumnData, TableData } from '@sdata/web-react';

import { Table } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const columns: TableColumnData[] = [
    { title: '名称', dataIndex: 'name' },
    { title: '编号', dataIndex: 'key' },
  ];
  const [data, setData] = useState<TableData[]>(
    Array.from({ length: 200 }, (_, key) => ({ key, name: `记录 ${key + 1}` })),
  );
  function handleChange(rows: TableData[]) {
    setData(rows);
  }

  return (
    <>
      <Table
        columns={columns}
        data={data}
        pagination={false}
        draggable={{ width: 40 }}
        virtualListProps={{ height: 280, estimatedSize: 40 }}
        onChange={handleChange}
      />
    </>
  );
}
