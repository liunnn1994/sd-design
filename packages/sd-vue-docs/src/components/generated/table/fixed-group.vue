<template>
  <sd-table :columns="columns" :data="data" :bordered="{ cell: true }" :scroll="{ x: 2000 }" />
</template>
<script setup lang="ts">
  import type { TableColumnData, TableData } from '@sdata/web-vue';

  import { reactive } from 'vue';
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name', fixed: 'left', width: 140 },
    {
      title: '用户信息',
      children: [
        { title: '生日', dataIndex: 'birthday', fixed: 'left', width: 200 },
        {
          title: '地址',
          children: [
            { title: '城市', dataIndex: 'city', fixed: 'left', width: 100 },
            { title: '道路', dataIndex: 'road' },
            { title: '序号', dataIndex: 'no' },
          ],
        },
      ],
    },
    {
      title: '信息',
      children: [
        { title: '电子邮箱', dataIndex: 'email' },
        { title: '电话', dataIndex: 'phone' },
      ],
    },
    { title: '薪资', dataIndex: 'salary', fixed: 'right', width: 120 },
  ];
  const data = reactive<TableData[]>([
    {
      key: '1',
      name: '王芳',
      salary: 23000,
      birthday: '1994-04-21',
      city: '伦敦',
      road: '示例路',
      no: '34',
      phone: '12345678',
      email: 'jane.doe@example.com',
    },
    {
      key: '2',
      name: '张晓',
      salary: 25000,
      birthday: '1994-05-21',
      city: '伦敦',
      road: '示例路',
      no: '37',
      phone: '12345678',
      email: 'alisa.ross@example.com',
    },
    {
      key: '3',
      name: '赵晨',
      salary: 22000,
      birthday: '1992-02-11',
      city: '巴黎',
      road: 'SD',
      no: '67',
      phone: '12345678',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '4',
      name: '李明',
      salary: 17000,
      birthday: '1991-06-21',
      city: '伦敦',
      road: '示例路',
      no: '317',
      phone: '12345678',
      email: 'ed.hellen@example.com',
    },
    {
      key: '5',
      name: '陈宇',
      salary: 27000,
      birthday: '1996-08-21',
      city: '巴黎',
      road: '示例路',
      no: '114',
      phone: '12345678',
      email: 'william.smith@example.com',
    },
  ]);
</script>
