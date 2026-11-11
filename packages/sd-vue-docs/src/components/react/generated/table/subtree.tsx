/** @jsxImportSource react */
import type { TableColumnData, TableData, TableRowSelection } from '@sdata/web-react';

import { Space, Switch, Table } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<TableRowSelection>({
    type: 'checkbox',
    showCheckedAll: true,
    checkStrictly: true,
  });
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const data: TableData[] = [
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
          children: [
            {
              key: '3',
              name: '李明',
              salary: 17000,
              address: '示例路 42 号',
              email: 'ed.hellen@example.com',
            },
            {
              key: '4',
              name: '陈宇',
              salary: 27000,
              address: '示例路 62 号',
              email: 'william.smith@example.com',
            },
          ],
        },
        {
          key: '5',
          name: '张晓',
          salary: 25000,
          address: '示例路 35 号',
          email: 'alisa.ross@example.com',
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
    },
    {
      key: '8',
      name: '李明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '9',
      name: '陈宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
      children: [],
    },
  ];

  return (
    <>
      <Space>
        <span>{'checkStrictly:'}</span>
        <Switch
          value={rowSelection.checkStrictly}
          onChange={(next) =>
            setRowSelection((previous) => {
              const draft = structuredClone(previous);
              draft.checkStrictly = next as (typeof rowSelection)['checkStrictly'];
              return draft;
            })
          }
        />
      </Space>
      <Table
        columns={columns}
        data={data}
        expandedKeys={expandedKeys}
        onExpandedKeysChange={(next) => setExpandedKeys(next as typeof expandedKeys)}
        rowSelection={rowSelection}
        showEmptyTree={true}
        className={'sd:mt-5'}
      />
    </>
  );
}
