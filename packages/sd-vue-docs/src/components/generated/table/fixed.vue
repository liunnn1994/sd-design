<template>
  <sd-table :columns="columns" :data="data" :scroll="scroll" :expandable="expandable" />
</template>
<script setup lang="ts">
  import type { TableColumnData, TableData, TableExpandable } from '@sdata/web-vue';

  import { reactive } from 'vue';
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name', fixed: 'left', width: 140 },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email', fixed: 'right', width: 200 },
  ];
  const expandable: TableExpandable = { title: '展开', width: 80 };
  const scroll = { x: 2000, y: 200 };
  const data = reactive<TableData[]>([
    {
      key: '1',
      name: '王芳',
      salary: 23000,
      address: '示例路 32 号',
      email: 'jane.doe@example.com',
      expand: '展开内容',
    },
    {
      key: '2',
      name: '张晓',
      salary: 25000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '3',
      name: '赵晨',
      salary: 22000,
      address: '示例路 31 号',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '4',
      name: '李明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '5',
      name: '陈宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
    },
  ]);
</script>
