<template>
  <sd-space>
    <span>checkStrictly:</span> <sd-switch v-model="rowSelection.checkStrictly" />
  </sd-space>
  <sd-table
    :columns="columns"
    :data="data"
    v-model:expandedKeys="expandedKeys"
    :row-selection="rowSelection"
    show-empty-tree
    class="sd:mt-5"
  />
</template>
<script setup lang="ts">
  import type { TableColumnData, TableData, TableRowSelection } from '@sdata/web-vue';

  import { reactive, ref } from 'vue';
  const expandedKeys = ref<string[]>([]);
  const rowSelection = reactive<TableRowSelection>({
    type: 'checkbox',
    showCheckedAll: true,
    checkStrictly: true,
  });
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const data: TableData[] = [
    {
      key: '1',
      name: '王芳',
      salary: 23000,
      address: '示例路 32 号',
      email: 'jane.doe@example.com',
      children: [
        {
          key: '2',
          name: '张晓',
          salary: 25000,
          address: '示例路 35 号',
          email: 'alisa.ross@example.com',
          children: [
            {
              key: '3',
              name: '李明',
              salary: 17000,
              address: '示例路 42 号',
              email: 'ed.hellen@example.com',
            },
            {
              key: '4',
              name: '陈宇',
              salary: 27000,
              address: '示例路 62 号',
              email: 'william.smith@example.com',
            },
          ],
        },
        {
          key: '5',
          name: '张晓',
          salary: 25000,
          address: '示例路 35 号',
          email: 'alisa.ross@example.com',
        },
      ],
    },
    {
      key: '6',
      name: '张晓',
      salary: 25000,
      address: '示例路 35 号',
      email: 'alisa.ross@example.com',
    },
    {
      key: '7',
      name: '赵晨',
      salary: 22000,
      address: '示例路 31 号',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '8',
      name: '李明',
      salary: 17000,
      address: '示例路 42 号',
      email: 'ed.hellen@example.com',
    },
    {
      key: '9',
      name: '陈宇',
      salary: 27000,
      address: '示例路 62 号',
      email: 'william.smith@example.com',
      children: [],
    },
  ];
</script>
