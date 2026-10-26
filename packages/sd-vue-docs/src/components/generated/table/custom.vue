<template>
  <sd-table :columns="columns" :data="data">
    <template #optional="{ record }">
      <sd-button @click="$modal.info({ title: '姓名', content: record.name })">查看</sd-button>
    </template>
  </sd-table>
  <sd-table :data="data" class="sd:mt-7.5">
    <template #columns>
      <sd-table-column title="姓名">
        <sd-table-column title="名" data-index="first"></sd-table-column>
        <sd-table-column title="姓" data-index="last"></sd-table-column>
      </sd-table-column>
      <sd-table-column title="薪资" data-index="salary"></sd-table-column>
      <sd-table-column title="地址" data-index="address"></sd-table-column>
      <sd-table-column title="电子邮箱" data-index="email"></sd-table-column>
      <sd-table-column title="可选">
        <template #cell="{ record }">
          <sd-button @click="$modal.info({ title: '姓名', content: record.name })">查看</sd-button>
        </template>
      </sd-table-column>
    </template>
  </sd-table>
</template>
<script setup lang="ts">
  import type { TableColumnData, TableData } from '@sdata/web-vue';

  import { ref } from 'vue';
  const show = ref(true);
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
    { title: '可选', slotName: 'optional' },
  ];
  const data: TableData[] = [
    {
      key: '1',
      name: '王芳',
      first: '王',
      last: '芳',
      salary: 23000,
      address: '示例路 32 号',
      email: 'jane.doe@example.com',
    },
    {
      key: '2',
      name: '张晓',
      first: '张',
      last: '晓',
      salary: 25000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '3',
      name: '赵晨',
      first: '赵',
      last: '晨',
      salary: 22000,
      address: '示例路 31 号',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '4',
      name: '李明',
      first: '李',
      last: '明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '5',
      name: '陈宇',
      first: '陈',
      last: '宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
    },
  ];
</script>
