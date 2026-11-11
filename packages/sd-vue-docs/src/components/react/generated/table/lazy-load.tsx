/** @jsxImportSource react */
import type { TableColumnData, TableData, TableLoadMore } from '@sdata/web-react';

import { Table } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const [data, setData] = useState<TableData[]>([
    {
      key: '1',
      name: '王芳',
      salary: 23000,
      address: '示例路 32 号',
      email: 'jane.doe@example.com',
      children: [
        {
          key: '2',
          name: '张晓',
          salary: 25000,
          address: '示例路 35 号',
          email: 'alisa.ross@example.com',
        },
        {
          key: '5',
          name: '张晓',
          salary: 25000,
          address: '示例路 35 号',
          email: 'alisa.ross@example.com',
          isLeaf: true,
        },
      ],
    },
    {
      key: '6',
      name: '张晓',
      salary: 25000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '7',
      name: '赵晨',
      salary: 22000,
      address: '示例路 31 号',
      email: 'kevin.sandra@example.com',
      isLeaf: true,
    },
    {
      key: '8',
      name: '李明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
      isLeaf: true,
    },
    {
      key: '9',
      name: '陈宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
      isLeaf: true,
    },
  ]);
  const loadMore: TableLoadMore = (record, done) => {
    window.setTimeout(() => {
      done([
        {
          key: `${record.key}-1`,
          name: '李明',
          salary: 17000,
          address: '示例路 42 号',
          email: 'ed.hellen@example.com',
          isLeaf: true,
        },
        {
          key: `${record.key}-2`,
          name: '陈宇',
          salary: 27000,
          address: '示例路 62 号',
          email: 'william.smith@example.com',
          isLeaf: true,
        },
      ]);
    }, 2000);
  };

  return (
    <>
      <Table columns={columns} data={data} loadMore={loadMore} />
    </>
  );
}
