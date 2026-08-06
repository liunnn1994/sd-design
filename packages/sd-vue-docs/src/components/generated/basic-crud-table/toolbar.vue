<template>
  <sd-basic-crud-table
    v-model:toolbar-model="filters"
    v-model:modal-model="form"
    title="设备列表"
    :columns="columns"
    :fetch-table-api="fetchDevices"
    :create-api="createDevice"
    :update-api="updateDevice"
    :delete-api="deleteDevice"
    delete-name-key="name"
    :toolbar-props="{ schemas, allowExpand: true }"
    :modal-form-props="{ schemas: formSchemas }"
  >
    <template #toolbar__action_middle>
      <sd-button>批量导入</sd-button>
    </template>
    <template #toolbar__action_append>
      <sd-button>导出</sd-button>
    </template>
  </sd-basic-crud-table>
</template>
<script setup lang="ts">
  import type { JsonFormSchema, TableColumnData } from '@sdata/web-vue';

  import { ref } from 'vue';

  interface Device {
    key: number;
    id: number;
    name: string;
    status: string;
    ip: string;
  }

  const filters = ref({ keyword: '', status: '' });
  const form = ref<Record<string, unknown>>({ name: '', status: '在线', ip: '' });

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

  const formSchemas: JsonFormSchema<string>[] = [
    { field: 'name', label: '设备名称', type: 'input', required: true },
    {
      field: 'status',
      label: '状态',
      type: 'select',
      componentProps: {
        options: [
          { label: '在线', value: '在线' },
          { label: '离线', value: '离线' },
        ],
      },
    },
    { field: 'ip', label: 'IP 地址', type: 'input', componentProps: { placeholder: '10.0.0.1' } },
  ];

  const devices = ref<Device[]>([
    { key: 1, id: 1, name: '边缘节点 A', status: '在线', ip: '10.0.0.1' },
    { key: 2, id: 2, name: '边缘节点 B', status: '离线', ip: '10.0.0.2' },
    { key: 3, id: 3, name: '边缘节点 C', status: '在线', ip: '10.0.0.3' },
  ]);

  async function fetchDevices(params: Record<string, unknown>) {
    const keyword = String(params.keyword ?? '');
    const status = String(params.status ?? '');
    const data = devices.value.filter(
      (item) => (!keyword || item.name.includes(keyword)) && (!status || item.status === status),
    );
    return { data, total: data.length };
  }
  async function createDevice(data: Record<string, unknown>) {
    const id = Date.now();
    devices.value = [
      ...devices.value,
      {
        key: id,
        id,
        name: String(data.name),
        status: String(data.status),
        ip: String(data.ip ?? ''),
      },
    ];
  }
  async function updateDevice(data: Record<string, unknown>) {
    devices.value = devices.value.map((item) =>
      item.id === data.id
        ? {
            ...item,
            name: String(data.name),
            status: String(data.status),
            ip: String(data.ip ?? ''),
          }
        : item,
    );
  }
  async function deleteDevice(row: Record<string, unknown>) {
    devices.value = devices.value.filter((item) => item.id !== row.id);
  }
</script>
