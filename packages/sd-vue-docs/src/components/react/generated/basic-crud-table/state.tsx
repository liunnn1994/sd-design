/** @jsxImportSource react */
import type { TableColumnData, TableData } from '@sdata/web-react';

import { BasicCrudTable } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [rows, setRows] = useState<TableData[]>([
    { key: 1, name: '初始记录' },
    { key: 2, name: '另一条记录' },
  ]);
  const columns: TableColumnData[] = [{ title: '名称', dataIndex: 'name' }];
  function addRow() {
    const key = rows.length + 1;
    setRows([...rows, { key, name: `新增记录 ${key}` }]);
  }
  async function deleteRow(row: Record<string, unknown>) {
    setRows(rows.filter((item) => item.key !== row.key));
  }

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <BasicCrudTable
          tableData={rows}
          onTableDataChange={(next) => setRows(next as typeof rows)}
          title={'本地数据（受控）'}
          columns={columns}
          fetchTableOnMounted={false}
          showToolbar={false}
          openCreateModal={false}
          deleteApi={deleteRow}
          onCreate={addRow}
        />
        <p>
          {'当前共 '}
          {formatValue(rows.length)}
          {' 条记录，数据完全由外部控制。'}
        </p>
      </div>
    </>
  );
}
