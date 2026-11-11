/** @jsxImportSource react */
import type { TableChangeExtra, TableColumnData, TableData } from '@sdata/web-react';

import { Button, Input, Space, Table } from '@sdata/web-react';
import { IconSearch } from '@sdata/web-react/icon';
import { createElement, useState } from 'react';

export default function Example() {
  const columns: TableColumnData[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      filterable: {
        filter: (value, record) => String(record.name).includes(String(value)),
        slotName: 'name-filter',
        icon: () => createElement(IconSearch, null),
      },
    },
    { title: '薪资', dataIndex: 'salary', sortable: { sortDirections: ['ascend'] } },
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
  const handleChange = (
    data: TableData[],
    extra: TableChangeExtra,
    currentDataSource: import('@sdata/web-react').TableDataWithRaw[],
  ) => {
    console.log('change', data, extra, currentDataSource);
  };

  return (
    <>
      <Table
        data-v-a39e471b=""
        columns={columns}
        data={data}
        onChange={handleChange}
        filterSlots={{
          'name-filter': ({
            filterValue,
            setFilterValue,
            handleFilterConfirm,
            handleFilterReset,
          }) => (
            <>
              <div data-v-a39e471b="" className={'custom-filter'}>
                <Space data-v-a39e471b="" direction={'vertical'}>
                  <Input
                    data-v-a39e471b=""
                    value={filterValue[0]}
                    onInput={(value) => setFilterValue([value])}
                  />
                  <div data-v-a39e471b="" className={'custom-filter-footer'}>
                    <Button
                      data-v-a39e471b=""
                      onClick={(event) => handleFilterConfirm(event.nativeEvent)}
                    >
                      {'确认'}
                    </Button>
                    <Button
                      data-v-a39e471b=""
                      onClick={(event) => handleFilterReset(event.nativeEvent)}
                    >
                      {'重置'}
                    </Button>
                  </div>
                </Space>
              </div>
            </>
          ),
        }}
      />
      <style>
        {
          '\n.custom-filter {\n    padding: 20px;\n    background: var(--color-bg-5);\n    border: 1px solid var(--color-neutral-3);\n    border-radius: var(--border-radius-medium);\n    box-shadow: 0 2px 5px rgb(0 0 0 / 10%);\n}\n.custom-filter-footer {\n    display: flex;\n    justify-content: space-between;\n}\n'
        }
      </style>
    </>
  );
}
