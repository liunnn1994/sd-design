<template>
  <sd-scrollbar type="track" :outer-style="{ height: '280px' }" class="table-sticky-demo">
    <sd-table :columns="columns" :data="data" sticky-header :pagination="false" />
  </sd-scrollbar>
</template>

<script setup lang="ts">
  import type { TableColumnData, TableData } from '@sdata/web-vue';

  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];

  const data: TableData[] = Array.from({ length: 20 }, (_, index) => {
    const key = index + 1;
    return {
      key: String(key),
      name: `用户 ${key}`,
      salary: 20000 + key * 1200,
      address: `${30 + key} Park Road, London`,
      email: `user.${key}@example.com`,
    };
  });
</script>

<style scoped>
  .table-sticky-demo {
    height: 280px;
    overflow: auto;
  }
</style>
