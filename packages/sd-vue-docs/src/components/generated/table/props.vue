<template>
  <div class="sd:grid sd:gap-4">
    <sd-form layout="inline" :model="form">
      <sd-form-item label="边框" field="border">
        <sd-switch v-model="form.border" />
      </sd-form-item>
      <sd-form-item label="悬停" field="hover"> <sd-switch v-model="form.hover" /> </sd-form-item>
      <sd-form-item label="斑马纹" field="stripe">
        <sd-switch v-model="form.stripe" />
      </sd-form-item>
      <sd-form-item label="多选框" field="checkbox">
        <sd-switch v-model="form.checkbox" />
      </sd-form-item>
      <sd-form-item label="checkAll" field="checkAll">
        <sd-switch v-model="rowSelection.showCheckedAll" />
      </sd-form-item>
      <sd-form-item label="加载中" field="loading">
        <sd-switch v-model="form.loading" />
      </sd-form-item>
      <sd-form-item label="tableHeader" field="tableHeader">
        <sd-switch v-model="form.tableHeader" />
      </sd-form-item>
      <sd-form-item label="noData" field="noData">
        <sd-switch v-model="form.noData" />
      </sd-form-item>
    </sd-form>
    <sd-table
      :columns="columns"
      :data="form.noData ? [] : data"
      :bordered="form.border"
      :hoverable="form.hover"
      :stripe="form.stripe"
      :loading="form.loading"
      :show-header="form.tableHeader"
      :row-selection="form.checkbox ? rowSelection : undefined"
    />
  </div>
</template>
<script setup lang="ts">
  import type { TableColumnData, TableData, TableRowSelection } from '@sdata/web-vue';

  import { reactive } from 'vue';
  const form = reactive({
    border: true,
    borderCell: false,
    hover: true,
    stripe: false,
    checkbox: true,
    loading: false,
    tableHeader: true,
    noData: false,
  });
  const rowSelection = reactive<TableRowSelection>({ type: 'checkbox', showCheckedAll: true });
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
