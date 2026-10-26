<template>
  <sd-space direction="vertical" size="large" fill>
    <div> <span>仅当前项： </span> <sd-switch v-model="rowSelection.onlyCurrent" /> </div>
    <sd-table
      row-key="name"
      :columns="columns"
      :data="data"
      :row-selection="rowSelection"
      v-model:selectedKeys="selectedKeys"
      :pagination="pagination"
    />
  </sd-space>
</template>
<script setup lang="ts">
  import type { TableColumnData, TableData, TableRowSelection } from '@sdata/web-vue';

  import { reactive, ref } from 'vue';
  const selectedKeys = ref(['王芳', '张晓']);
  const rowSelection = reactive<TableRowSelection>({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
  });
  const pagination = { pageSize: 5 };
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const data = reactive<TableData[]>([
    {
      key: '1',
      name: '王芳',
      salary: 23000,
      address: '示例路 32 号',
      email: 'jane.doe@example.com',
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
      disabled: true,
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
    {
      key: '6',
      name: '王芳 2',
      salary: 15000,
      address: '示例路 32 号',
      email: 'jane.doe@example.com',
    },
    {
      key: '7',
      name: '张晓 2',
      salary: 28000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '8',
      name: '赵晨 2',
      salary: 26000,
      address: '示例路 31 号',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '9',
      name: '李明 2',
      salary: 18000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '10',
      name: '陈宇 2',
      salary: 12000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
    },
  ]);
</script>
