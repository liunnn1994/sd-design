<template>
  <sd-space direction="vertical" size="large" class="sd:w-full">
    <sd-table :columns="columns" :data="data" :span-method="spanMethod" />
    <sd-table
      :columns="columns"
      :data="data"
      :span-method="dataSpanMethod"
      :bordered="{ wrapper: true, cell: true }"
    />
    <sd-table
      :columns="columns"
      :data="data"
      :row-selection="{ type: 'checkbox' }"
      :span-method="spanMethodAll"
      span-all
      :bordered="{ wrapper: true, cell: true }"
    />
  </sd-space>
</template>
<script setup lang="ts">
  import type {
    TableColumnData,
    TableData,
    TableSpanMethod,
    TableSpanMethodContext,
  } from '@sdata/web-vue';
  const spanMethod: TableSpanMethod = ({ rowIndex, columnIndex }: TableSpanMethodContext) => {
    if (rowIndex === 1 && columnIndex === 1) {
      return { rowspan: 2, colspan: 3 };
    }
  };
  const dataSpanMethod: TableSpanMethod = ({ record, column }: TableSpanMethodContext) => {
    if (record.name === '张晓' && 'dataIndex' in column && column.dataIndex === 'salary') {
      return { rowspan: 2 };
    }
  };
  const spanMethodAll: TableSpanMethod = ({ rowIndex, columnIndex }: TableSpanMethodContext) => {
    if (rowIndex === 1 && columnIndex === 0) {
      return { rowspan: 2 };
    }
    if (rowIndex === 1 && columnIndex === 2) {
      return { rowspan: 2, colspan: 3 };
    }
  };
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
  ];
</script>
