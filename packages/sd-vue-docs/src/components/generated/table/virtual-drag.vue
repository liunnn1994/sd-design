<script setup lang="ts">
  import type { TableColumnData, TableData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const columns: TableColumnData[] = [
    { title: '名称', dataIndex: 'name' },
    { title: '编号', dataIndex: 'key' },
  ];
  const data = ref<TableData[]>(
    Array.from({ length: 200 }, (_, key) => ({ key, name: `记录 ${key + 1}` })),
  );
  function handleChange(rows: TableData[]) {
    data.value = rows;
  }
</script>

<template>
  <sd-table
    :columns="columns"
    :data="data"
    :pagination="false"
    :draggable="{ width: 40 }"
    :virtual-list-props="{ height: 280, estimatedSize: 40 }"
    @change="handleChange"
  />
</template>
