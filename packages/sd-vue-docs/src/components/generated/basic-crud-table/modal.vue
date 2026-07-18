<template>
  <sd-basic-crud-table
    v-model:modal-visible="visible"
    v-model:modal-model="form"
    title="受控弹窗"
    :columns="columns"
    :table-data="rows"
    :fetch-table-on-mounted="false"
    :show-toolbar="false"
    :create-api="createRow"
    :modal-form-props="{ schemas }"
  >
    <template #modal__title="{ type }">
      {{ type === 'create' ? '新增成员' : '编辑成员' }}
    </template>
  </sd-basic-crud-table>
  <p>弹窗状态：{{ visible ? '打开' : '关闭' }}；表单数据：{{ JSON.stringify(form) }}</p>
</template>

<script setup lang="ts">
  import type { JsonFormSchema, TableColumnData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const visible = ref(false);
  const form = ref<Record<string, unknown>>({ name: '', role: '成员' });
  const rows = ref([
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
    rows.value = [
      ...rows.value,
      { key: rows.value.length + 1, name: String(data.name), role: String(data.role) },
    ];
  }
</script>
