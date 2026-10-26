<template>
  <sd-table :columns="columns" :data="data" @change="handleChange">
    <template
      #name-filter="{ filterValue, setFilterValue, handleFilterConfirm, handleFilterReset }"
    >
      <div class="custom-filter">
        <sd-space direction="vertical">
          <sd-input :model-value="filterValue[0]" @input="(value) => setFilterValue([value])" />
          <div class="custom-filter-footer">
            <sd-button @click="handleFilterConfirm">确认</sd-button>
            <sd-button @click="handleFilterReset">重置</sd-button>
          </div>
        </sd-space>
      </div>
    </template>
  </sd-table>
</template>
<script setup lang="ts">
  import type { TableChangeExtra, TableColumnData, TableData } from '@sdata/web-vue';

  import { h, reactive } from 'vue';

  import { IconSearch } from '@sdata/web-vue/es/icon/index.js';
  const columns: TableColumnData[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      filterable: {
        filter: (value, record) => String(record.name).includes(String(value)),
        slotName: 'name-filter',
        icon: () => h(IconSearch),
      },
    },
    { title: '薪资', dataIndex: 'salary', sortable: { sortDirections: ['ascend'] } },
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
<style>
  .custom-filter {
    padding: 20px;
    background: var(--color-bg-5);
    border: 1px solid var(--color-neutral-3);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 2px 5px rgb(0 0 0 / 10%);
  }
  .custom-filter-footer {
    display: flex;
    justify-content: space-between;
  }
</style>
