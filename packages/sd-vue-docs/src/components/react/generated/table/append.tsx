/** @jsxImportSource react */
import type { TableColumnData, TableData } from '@sdata/web-react';

import { Button, Table } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
  ];
  const [data, setData] = useState<TableData[]>([
    { key: '1', name: '王芳', salary: 23000, address: '示例路 32 号' },
    { key: '2', name: '张晓', salary: 25000, address: '示例路 35 号' },
    { key: '3', name: '赵晨', salary: 22000, address: '示例路 31 号' },
  ]);
  const appendRecord = () => {
    setData((previous) => {
      const next = [...previous];
      next.push({
        key: String(data.length + 1),
        name: `新员工 ${data.length + 1}`,
        salary: 20000 + data.length * 1000,
        address: `${40 + data.length} Park Road, London`,
      });
      return next;
    });
  };

  return (
    <>
      <Table
        data-v-e2193557=""
        columns={columns}
        data={data}
        pagination={false}
        footer={
          <>
            <div data-v-e2193557="" className={'table-append-demo'}>
              <div data-v-e2193557="">
                <strong data-v-e2193557="">
                  {'已加载 '}
                  {formatValue(data.length)}
                  {' 条记录'}
                </strong>
                <div data-v-e2193557="" className={'table-append-demo__hint'}>
                  {'append 插槽会渲染在表格最后一行之后。'}
                </div>
              </div>
              <Button data-v-e2193557="" type={'primary'} size={'small'} onClick={appendRecord}>
                {'追加一条'}
              </Button>
            </div>
          </>
        }
      />
      <style>
        {
          '\n.table-append-demo[data-v-e2193557] {\n    display: flex;\n    gap: 16px;\n    align-items: center;\n    justify-content: space-between;\n    padding: 16px 20px;\n    background: var(--sd-color-fill-1);\n    border-top: 1px dashed var(--sd-color-neutral-3);\n}\n.table-append-demo__hint[data-v-e2193557] {\n    margin-top: 4px;\n    color: var(--sd-color-text-3);\n    font-size: 12px;\n}\n'
        }
      </style>
    </>
  );
}
