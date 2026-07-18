<template>
  <sd-basic-crud-table
    v-model:table-data="rows"
    title="本地数据（受控）"
    :columns="columns"
    :fetch-table-on-mounted="false"
    :show-toolbar="false"
    :open-create-modal="false"
    :delete-api="deleteRow"
    @create="addRow"
  />
  <p>当前共 {{ rows.length }} 条记录，数据完全由外部控制。</p>
</template>

<script setup lang="ts">
  import type { TableColumnData, TableData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const rows = ref<TableData[]>([
    { key: 1, name: '初始记录' },
    { key: 2, name: '另一条记录' },
  ]);
  const columns: TableColumnData[] = [{ title: '名称', dataIndex: 'name' }];

  function addRow() {
    const key = rows.value.length + 1;
    rows.value = [...rows.value, { key, name: `新增记录 ${key}` }];
  }
  async function deleteRow(row: Record<string, unknown>) {
    rows.value = rows.value.filter((item) => item.key !== row.key);
  }
</script>
