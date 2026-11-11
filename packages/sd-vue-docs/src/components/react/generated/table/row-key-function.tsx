/** @jsxImportSource react */
import type {
  TableColumnData,
  TableData,
  TableExpandable,
  TableRowKey,
  TableRowSelection,
} from '@sdata/web-react';

import { Space, Table } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [selectedKeys, setSelectedKeys] = useState(['EMP-1002']);
  const [expandedKeys, setExpandedKeys] = useState(['EMP-1001']);
  const columns: TableColumnData[] = [
    { title: '员工', dataIndex: 'name' },
    { title: '部门', dataIndex: 'department' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const [data, setData] = useState<TableData[]>([
    {
      id: 'EMP-1001',
      name: '王芳',
      department: '设计',
      email: 'jane.doe@example.com',
      expand: '负责组件规范与设计令牌维护。',
    },
    {
      id: 'EMP-1002',
      name: '张晓',
      department: 'Frontend',
      email: 'alisa.ross@example.com',
      expand: '负责表格、列表等数据展示组件。',
    },
    {
      id: 'EMP-1003',
      name: '赵晨',
      department: 'QA',
      email: 'kevin.sandra@example.com',
      expand: '负责文档站与组件回归验证。',
    },
  ]);
  const [rowSelection, setRowSelection] = useState<TableRowSelection>({
    type: 'checkbox',
    showCheckedAll: true,
  });
  const [expandable, setExpandable] = useState<TableExpandable>({ title: '详情', width: 88 });
  const getRowKey: TableRowKey = (record: TableData) => String(record.id ?? '');

  return (
    <>
      <Space data-v-d8ff765a="" direction={'vertical'} size={'medium'} fill={true}>
        <div data-v-d8ff765a="" className={'table-row-key-function-demo__status'}>
          <span data-v-d8ff765a="">
            {'已选中: '}
            {formatValue(selectedKeys.join(', ') || '无')}
          </span>
          <span data-v-d8ff765a="">
            {'已展开: '}
            {formatValue(expandedKeys.join(', ') || '无')}
          </span>
        </div>
        <Table
          data-v-d8ff765a=""
          columns={columns}
          data={data}
          rowKey={getRowKey}
          rowSelection={rowSelection}
          expandable={expandable}
          selectedKeys={selectedKeys}
          onSelectedKeysChange={(next) => setSelectedKeys(next as typeof selectedKeys)}
          expandedKeys={expandedKeys}
          onExpandedKeysChange={(next) => setExpandedKeys(next as typeof expandedKeys)}
          pagination={false}
        />
      </Space>
      <style>
        {
          '\n.table-row-key-function-demo__status[data-v-d8ff765a] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 16px;\n    color: var(--sd-color-text-2);\n    font-size: 13px;\n}\n'
        }
      </style>
    </>
  );
}
