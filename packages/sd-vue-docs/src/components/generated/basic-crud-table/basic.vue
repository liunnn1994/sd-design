<template>
  <sd-basic-crud-table
    title="用户列表"
    :columns="columns"
    :fetch-table-api="fetchUsers"
    :show-create="false"
    :show-edit="false"
    :show-delete="false"
  />
</template>
<script setup lang="ts">
  import type { TableColumnData } from '@sdata/web-vue';

  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '角色', dataIndex: 'role' },
    { title: '状态', dataIndex: 'status' },
  ];

  async function fetchUsers() {
    return {
      data: [
        { key: 1, name: '张三', role: '管理员', status: '在职' },
        { key: 2, name: '李四', role: '成员', status: '在职' },
        { key: 3, name: '王五', role: '成员', status: '离职' },
      ],
      total: 3,
    };
  }
</script>
