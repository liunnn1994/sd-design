/** @jsxImportSource react */
import type { TableColumnData, TableData } from '@sdata/web-react';

import { Switch, Table } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [scrollbar, setScrollbar] = useState(true);
  const scroll = { x: 2000, y: 200 };
  const scrollPercent = { x: '120%', y: '100%' };
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
    },
    {
      key: '2',
      name: '张晓',
      salary: 25000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '3',
      name: '赵晨',
      salary: 22000,
      address: '示例路 31 号',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '4',
      name: '李明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '5',
      name: '陈宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
    },
  ]);

  return (
    <>
      <div className={'sd:mb-5'}>
        <Switch value={scrollbar} onChange={(next) => setScrollbar(next as typeof scrollbar)} />
        {' 虚拟滚动条 '}
      </div>
      <Table columns={columns} data={data} scroll={scroll} scrollbar={scrollbar} />
      <div className={'sd:mt-7.5 sd:h-125'}>
        <Table columns={columns} data={data} scroll={scrollPercent} scrollbar={scrollbar} />
      </div>
    </>
  );
}
