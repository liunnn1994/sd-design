<template>
  <sd-basic-crud-table
    v-model:modal-model="form"
    title="成员管理"
    :columns="columns"
    :fetch-table-api="fetchMembers"
    :create-api="createMember"
    :update-api="updateMember"
    :delete-api="deleteMember"
    delete-name-key="name"
    :toolbar-props="{ schemas: searchSchemas }"
    :modal-form-props="{ schemas: formSchemas }"
  >
    <template #table__status="{ record }">
      <sd-tag :color="record.status ? 'green' : 'red'">
        {{ record.status ? '启用' : '禁用' }}
      </sd-tag>
    </template>
  </sd-basic-crud-table>
</template>

<script setup lang="ts">
  import type { JsonFormSchema, TableColumnData } from '@sdata/web-vue';

  import { ref } from 'vue';

  interface Member {
    key: number;
    id: number;
    name: string;
    role: string;
    status: boolean;
    email: string;
  }

  const members = ref<Member[]>([
    { key: 1, id: 1, name: '张三', role: '管理员', status: true, email: 'zhangsan@example.com' },
    { key: 2, id: 2, name: '李四', role: '成员', status: false, email: 'lisi@example.com' },
  ]);
  const form = ref<Record<string, unknown>>({ name: '', role: '成员', status: true, email: '' });

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
    const data = members.value.filter(
      (item) => (!keyword || item.name.includes(keyword)) && (!role || item.role === role),
    );
    return { data, total: data.length };
  }
  async function createMember(data: Record<string, unknown>) {
    const id = Date.now();
    members.value.push({
      key: id,
      id,
      name: String(data.name),
      role: String(data.role),
      status: Boolean(data.status),
      email: String(data.email ?? ''),
    });
  }
  async function updateMember(data: Record<string, unknown>) {
    const item = members.value.find((member) => member.id === data.id);
    if (item) Object.assign(item, data);
  }
  async function deleteMember(row: Record<string, unknown>) {
    members.value = members.value.filter((member) => member.id !== row.id);
  }
</script>
