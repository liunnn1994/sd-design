/** @jsxImportSource react */
import type { TableChangeExtra, TableColumnData, TableData } from '@sdata/web-react';

import { Space, Switch, Table } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [alignLeft, setAlignLeft] = useState(false);
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name', sortable: { sortDirections: ['ascend', 'descend'] } },
    {
      title: '薪资',
      dataIndex: 'salary',
      sortable: { sortDirections: ['ascend'] },
      filterable: {
        filters: [
          { text: '> 20000', value: '20000' },
          { text: '> 30000', value: '30000' },
        ],
        filter: (value, record) => Number(record.salary) > Number(value),
        multiple: true,
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
      filterable: {
        filters: [
          { text: '伦敦', value: '伦敦' },
          { text: '巴黎', value: '巴黎' },
        ],
        filter: (value, row) => String(row.address).includes(String(value)),
      },
    },
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
  const handleChange = (
    data: TableData[],
    extra: TableChangeExtra,
    currentDataSource: import('@sdata/web-react').TableDataWithRaw[],
  ) => {
    console.log('change', data, extra, currentDataSource);
  };

  return (
    <>
      <Space direction={'vertical'} size={'large'} fill={true}>
        <Space>
          <Switch value={alignLeft} onChange={(next) => setAlignLeft(next as typeof alignLeft)} />
          <span>
            {'筛选图标左对齐： '}
            {formatValue(alignLeft)}
          </span>
        </Space>
        <Table
          columns={columns}
          data={data}
          filterIconAlignLeft={alignLeft}
          onChange={handleChange}
        />
      </Space>
    </>
  );
}
