<template>
  <sd-basic-crud-table
    v-model:toolbar-model="filters"
    title="设备列表"
    :columns="columns"
    :toolbar-props="{ schemas, allowExpand: true }"
    :fetch-table-api="fetchDevices"
  />
</template>
<script setup lang="ts">
  import type { JsonFormSchema, TableColumnData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const filters = ref({ keyword: '', status: '' });
  const schemas: JsonFormSchema<string>[] = [
    {
      field: 'keyword',
      label: '关键词',
      type: 'input',
      componentProps: { placeholder: '设备名称' },
    },
    {
      field: 'status',
      label: '状态',
      type: 'select',
      componentProps: {
        allowClear: true,
        placeholder: '全部',
        options: [
          { label: '在线', value: '在线' },
          { label: '离线', value: '离线' },
        ],
      },
    },
  ];
  const columns: TableColumnData[] = [
    { title: '设备', dataIndex: 'name' },
    { title: '状态', dataIndex: 'status' },
    { title: 'IP', dataIndex: 'ip' },
  ];

  const allDevices = [
    { key: 1, name: '边缘节点 A', status: '在线', ip: '10.0.0.1' },
    { key: 2, name: '边缘节点 B', status: '离线', ip: '10.0.0.2' },
    { key: 3, name: '边缘节点 C', status: '在线', ip: '10.0.0.3' },
  ];

  async function fetchDevices(params: Record<string, unknown>) {
    const keyword = String(params.keyword ?? '');
    const status = String(params.status ?? '');
    const data = allDevices.filter(
      (item) => (!keyword || item.name.includes(keyword)) && (!status || item.status === status),
    );
    return { data, total: data.length };
  }
</script>
