/** @jsxImportSource react */
import type { TableColumnData, TableData } from '@sdata/web-react';

import { Button, Modal, Table, TableColumn } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [show, setShow] = useState(true);
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
    { title: '可选', slotName: 'optional' },
  ];
  const data: TableData[] = [
    {
      key: '1',
      name: '王芳',
      first: '王',
      last: '芳',
      salary: 23000,
      address: '示例路 32 号',
      email: 'jane.doe@example.com',
    },
    {
      key: '2',
      name: '张晓',
      first: '张',
      last: '晓',
      salary: 25000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '3',
      name: '赵晨',
      first: '赵',
      last: '晨',
      salary: 22000,
      address: '示例路 31 号',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '4',
      name: '李明',
      first: '李',
      last: '明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '5',
      name: '陈宇',
      first: '陈',
      last: '宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={data}
        cellSlots={{
          optional: ({ record: rawRecord }) => {
            const record = rawRecord as (typeof data)[number];
            return (
              <>
                <Button
                  onClick={() => {
                    Modal.info({ title: '姓名', content: String(record.name) });
                  }}
                >
                  {'查看'}
                </Button>
              </>
            );
          },
        }}
      />
      <Table data={data} className={'sd:mt-7.5'}>
        <TableColumn title={'姓名'}>
          <TableColumn title={'名'} data-index={'first'} />
          <TableColumn title={'姓'} data-index={'last'} />
        </TableColumn>
        <TableColumn title={'薪资'} data-index={'salary'} />
        <TableColumn title={'地址'} data-index={'address'} />
        <TableColumn title={'电子邮箱'} data-index={'email'} />
        <TableColumn
          title={'可选'}
          render={({ record }) => (
            <>
              <Button
                onClick={() => {
                  Modal.info({ title: '姓名', content: String(record.name) });
                }}
              >
                {'查看'}
              </Button>
            </>
          )}
        />
      </Table>
    </>
  );
}
