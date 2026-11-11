/** @jsxImportSource react */
import type { JsonFormSchema, TableColumnData } from '@sdata/web-react';

import { BasicCrudTable, Link, Popconfirm, Tag } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type Rule = {
    key: number;
    id: number;
    name: string;
    level: string;
    enabled: boolean;
  };
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState<Record<string, unknown>>({
    name: '',
    level: '警告',
    enabled: true,
  });
  const [rows, setRows] = useState<Rule[]>([
    { key: 1, id: 1, name: '告警规则 A', level: '严重', enabled: true },
    { key: 2, id: 2, name: '告警规则 B', level: '警告', enabled: false },
  ]);
  const columns: TableColumnData[] = [
    { title: '规则名称', dataIndex: 'name' },
    { title: '级别', dataIndex: 'level' },
    { title: '状态', dataIndex: 'enabled', slotName: 'enabled', align: 'center' },
  ];
  const formSchemas: JsonFormSchema<string>[] = [
    { field: 'name', label: '规则名称', type: 'input', required: true },
    {
      field: 'level',
      label: '级别',
      type: 'select',
      componentProps: {
        options: [
          { label: '严重', value: '严重' },
          { label: '警告', value: '警告' },
          { label: '提示', value: '提示' },
        ],
      },
    },
    { field: 'enabled', label: '启用', type: 'switch' },
  ];
  async function createRow(data: Record<string, unknown>) {
    const id = Date.now();
    setRows([
      ...rows,
      {
        key: id,
        id,
        name: String(data.name),
        level: String(data.level),
        enabled: Boolean(data.enabled),
      },
    ]);
  }
  async function updateRow(data: Record<string, unknown>) {
    setRows(
      rows.map((item) =>
        item.id === data.id
          ? {
              ...item,
              name: String(data.name),
              level: String(data.level),
              enabled: Boolean(data.enabled),
            }
          : item,
      ),
    );
  }
  async function deleteRow(row: Record<string, unknown>) {
    setRows(rows.filter((item) => item.id !== row.id));
  }

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <BasicCrudTable
          modalModel={form}
          onModalModelChange={(next) => setForm(next as typeof form)}
          columns={columns}
          tableData={rows}
          fetchTableOnMounted={false}
          showToolbar={false}
          actionWidth={260}
          createApi={createRow}
          updateApi={updateRow}
          deleteApi={deleteRow}
          deleteNameKey={'name'}
          modalFormProps={{ schemas: formSchemas }}
          slots={{
            table__enabled: ({ record: rawRecord }) => {
              const record = rawRecord as (typeof rows)[number];
              return (
                <>
                  <Tag color={record.enabled ? 'green' : 'gray'}>
                    {formatValue(record.enabled ? '启用' : '禁用')}
                  </Tag>
                </>
              );
            },
            table__action_prepend: ({ record: rawRecord }) => {
              const record = rawRecord as (typeof rows)[number];
              return (
                <>
                  <Link
                    ellipsis={false}
                    onClick={() => {
                      setSelected(String(record.name));
                    }}
                  >
                    {'详情'}
                  </Link>
                </>
              );
            },
            table__action_append: ({ record: rawRecord }) => {
              const record = rawRecord as (typeof rows)[number];
              return (
                <>
                  <Link
                    ellipsis={false}
                    onClick={() => {
                      setSelected(String(record.name));
                    }}
                  >
                    {'查看'}
                  </Link>
                  <Popconfirm
                    content={`确定禁用【${record.name}】吗？`}
                    type={'warning'}
                    onOk={() => {
                      setSelected(`已禁用 ${record.name}`);
                    }}
                  >
                    <Link ellipsis={false} status={'warning'}>
                      {'禁用'}
                    </Link>
                  </Popconfirm>
                </>
              );
            },
          }}
        />
        <p>
          {'当前选择：'}
          {formatValue(selected || '无')}
        </p>
      </div>
    </>
  );
}
