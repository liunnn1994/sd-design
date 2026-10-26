<template>
  <sd-space direction="vertical" size="large" fill>
    <sd-space>
      <sd-switch v-model="alignLeft" /> <span>筛选图标左对齐： {{ alignLeft }}</span>
    </sd-space>
    <sd-table
      :columns="columns"
      :data="data"
      :filter-icon-align-left="alignLeft"
      @change="handleChange"
    />
  </sd-space>
</template>
<script setup lang="ts">
  import type { TableChangeExtra, TableColumnData, TableData } from '@sdata/web-vue';

  import { reactive, ref } from 'vue';
  const alignLeft = ref(false);
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name', sortable: { sortDirections: ['ascend', 'descend'] } },
    {
      title: '薪资',
      dataIndex: 'salary',
      sortable: { sortDirections: ['ascend'] },
      filterable: {
        filters: [
          { text: '> 20000', value: '20000' },
          { text: '> 30000', value: '30000' },
        ],
        filter: (value, record) => Number(record.salary) > Number(value),
        multiple: true,
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
      filterable: {
        filters: [
          { text: '伦敦', value: '伦敦' },
          { text: '巴黎', value: '巴黎' },
        ],
        filter: (value, row) => String(row.address).includes(String(value)),
      },
    },
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
  const handleChange = (
    data: TableData[],
    extra: TableChangeExtra,
    currentDataSource: import('../../../../../web-vue/components/table/interface').TableDataWithRaw[],
  ) => {
    console.log('change', data, extra, currentDataSource);
  };
</script>
