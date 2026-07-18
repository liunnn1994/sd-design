<template>
  <sd-basic-crud-table
    v-model:modal-model="form"
    :columns="columns"
    :table-data="rows"
    :fetch-table-on-mounted="false"
    :show-toolbar="false"
    :action-width="260"
    :create-api="createRow"
    :update-api="updateRow"
    :delete-api="deleteRow"
    delete-name-key="name"
    :modal-form-props="{ schemas: formSchemas }"
  >
    <template #table__enabled="{ record }">
      <sd-tag :color="record.enabled ? 'green' : 'gray'">
        {{ record.enabled ? '启用' : '禁用' }}
      </sd-tag>
    </template>
    <template #table__action_prepend="{ record }">
      <sd-link :ellipsis="false" @click="selected = record.name">详情</sd-link>
    </template>
    <template #table__action_append="{ record }">
      <sd-link :ellipsis="false" @click="selected = record.name">查看</sd-link>
      <sd-popconfirm
        :content="`确定禁用【${record.name}】吗？`"
        type="warning"
        @ok="selected = `已禁用 ${record.name}`"
      >
        <sd-link :ellipsis="false" status="warning">禁用</sd-link>
      </sd-popconfirm>
    </template>
  </sd-basic-crud-table>
  <p>当前选择：{{ selected || '无' }}</p>
</template>

<script setup lang="ts">
  import type { JsonFormSchema, TableColumnData } from '@sdata/web-vue';

  import { ref } from 'vue';

  interface Rule {
    key: number;
    id: number;
    name: string;
    level: string;
    enabled: boolean;
  }

  const selected = ref('');
  const form = ref<Record<string, unknown>>({ name: '', level: '警告', enabled: true });
  const rows = ref<Rule[]>([
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
    rows.value = [
      ...rows.value,
      {
        key: id,
        id,
        name: String(data.name),
        level: String(data.level),
        enabled: Boolean(data.enabled),
      },
    ];
  }
  async function updateRow(data: Record<string, unknown>) {
    rows.value = rows.value.map((item) =>
      item.id === data.id
        ? {
            ...item,
            name: String(data.name),
            level: String(data.level),
            enabled: Boolean(data.enabled),
          }
        : item,
    );
  }
  async function deleteRow(row: Record<string, unknown>) {
    rows.value = rows.value.filter((item) => item.id !== row.id);
  }
</script>
