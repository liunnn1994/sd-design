/** @jsxImportSource react */
import type { JsonFormSchema, TableColumnData } from '@sdata/web-react';

import { BasicCrudTable, Tag } from '@sdata/web-react';
import { useRef } from 'react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type Member = {
    key: number;
    id: number;
    name: string;
    role: string;
    status: boolean;
    email: string;
  };
  const members = useRef<Member[]>([
    { key: 1, id: 1, name: '张三', role: '管理员', status: true, email: 'zhangsan@example.com' },
    { key: 2, id: 2, name: '李四', role: '成员', status: false, email: 'lisi@example.com' },
  ]);
  const [form, setForm] = useState<Record<string, unknown>>({
    name: '',
    role: '成员',
    status: true,
    email: '',
  });
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '角色', dataIndex: 'role' },
    { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center' },
    { title: '邮箱', dataIndex: 'email' },
  ];
  const searchSchemas: JsonFormSchema<string>[] = [
    { field: 'keyword', label: '关键词', type: 'input', componentProps: { placeholder: '姓名' } },
    {
      field: 'role',
      label: '角色',
      type: 'select',
      componentProps: {
        allowClear: true,
        placeholder: '全部',
        options: [
          { label: '管理员', value: '管理员' },
          { label: '成员', value: '成员' },
        ],
      },
    },
  ];
  const formSchemas: JsonFormSchema<string>[] = [
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
    { field: 'status', label: '启用', type: 'switch' },
    {
      field: 'email',
      label: '邮箱',
      type: 'input',
      componentProps: { placeholder: 'example@x.com' },
    },
  ];
  async function fetchMembers(params: Record<string, unknown>) {
    const keyword = String(params.keyword ?? '');
    const role = String(params.role ?? '');
    const data = members.current.filter(
      (item) => (!keyword || item.name.includes(keyword)) && (!role || item.role === role),
    );
    return { data, total: data.length };
  }
  async function createMember(data: Record<string, unknown>) {
    const id = Date.now();
    members.current = ((previous) => {
      const next = [...previous];
      next.push({
        key: id,
        id,
        name: String(data.name),
        role: String(data.role),
        status: Boolean(data.status),
        email: String(data.email ?? ''),
      });
      return next;
    })(members.current);
  }
  async function updateMember(data: Record<string, unknown>) {
    const item = members.current.find((member) => member.id === data.id);
    if (item) Object.assign(item, data);
  }
  async function deleteMember(row: Record<string, unknown>) {
    members.current = members.current.filter((member) => member.id !== row.id);
  }

  return (
    <>
      <BasicCrudTable
        modalModel={form}
        onModalModelChange={(next) => setForm(next as typeof form)}
        title={'成员管理'}
        columns={columns}
        fetchTableApi={fetchMembers}
        createApi={createMember}
        updateApi={updateMember}
        deleteApi={deleteMember}
        deleteNameKey={'name'}
        toolbarProps={{ schemas: searchSchemas }}
        modalFormProps={{ schemas: formSchemas }}
        slots={{
          table__status: ({ record: rawRecord }) => {
            const record = rawRecord as Member;
            return (
              <>
                <Tag color={record.status ? 'green' : 'red'}>
                  {formatValue(record.status ? '启用' : '禁用')}
                </Tag>
              </>
            );
          },
        }}
      />
    </>
  );
}
