/** @jsxImportSource react */
import type { JsonFormSchema, TableColumnData } from '@sdata/web-react';

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
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({ name: '', role: '成员' });
  const [rows, setRows] = useState([
    { key: 1, name: '张三', role: '管理员' },
    { key: 2, name: '李四', role: '成员' },
  ]);
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '角色', dataIndex: 'role' },
  ];
  const schemas: JsonFormSchema<string>[] = [
    { field: 'name', label: '姓名', type: 'input', required: true },
    {
      field: 'role',
      label: '角色',
      type: 'select',
      componentProps: {
        options: [
          { label: '管理员', value: '管理员' },
          { label: '成员', value: '成员' },
        ],
      },
    },
  ];
  async function createRow(data: Record<string, unknown>) {
    setRows([...rows, { key: rows.length + 1, name: String(data.name), role: String(data.role) }]);
  }

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <BasicCrudTable
          modalVisible={visible}
          onModalVisibleChange={(next) => setVisible(next as typeof visible)}
          modalModel={form}
          onModalModelChange={(next) => setForm(next as typeof form)}
          title={'受控弹窗'}
          columns={columns}
          tableData={rows}
          fetchTableOnMounted={false}
          showToolbar={false}
          createApi={createRow}
          modalFormProps={{ schemas }}
          slots={{
            modal__title: ({ type }) => (
              <>{formatValue(type === 'create' ? '新增成员' : '编辑成员')}</>
            ),
          }}
        />
        <p>
          {'弹窗状态：'}
          {formatValue(visible ? '打开' : '关闭')}
          {'；表单数据：'}
          {formatValue(JSON.stringify(form))}
        </p>
      </div>
    </>
  );
}
