<template>
  <sd-basic-crud-table
    :columns="columns"
    :table-data="rows"
    :fetch-table-on-mounted="false"
    :show-toolbar="false"
    :action-width="260"
  >
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
  import type { TableColumnData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const selected = ref('');
  const rows = [
    { key: 1, name: '告警规则 A' },
    { key: 2, name: '告警规则 B' },
  ];
  const columns: TableColumnData[] = [{ title: '规则名称', dataIndex: 'name' }];
</script>
