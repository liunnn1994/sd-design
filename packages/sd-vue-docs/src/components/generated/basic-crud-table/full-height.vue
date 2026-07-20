<template>
  <div class="sd:h-[520px]">
    <sd-basic-crud-table
      v-model:toolbar-model="filters"
      v-model:modal-model="form"
      full-height
      title="设备列表"
      :columns="columns"
      :fetch-table-api="fetchDevices"
      :create-api="createDevice"
      :update-api="updateDevice"
      :detail-api="getDeviceDetail"
      :delete-api="deleteDevice"
      delete-name-key="name"
      :toolbar-props="{ schemas: searchSchemas }"
      :modal-form-props="{ schemas: formSchemas }"
    >
      <template #table__status="{ record }">
        <sd-tag :color="record.status === '在线' ? 'green' : 'red'">
          {{ record.status }}
        </sd-tag>
      </template>
    </sd-basic-crud-table>
  </div>
</template>

<script setup lang="ts">
  import type { JsonFormSchema, TableColumnData } from '@sdata/web-vue';

  import { ref } from 'vue';

  interface Device {
    key: number;
    id: number;
    name: string;
    address: string;
    status: string;
  }

  const devices = ref<Device[]>(
    Array.from({ length: 28 }, (_, index) => ({
      key: index + 1,
      id: index + 1,
      name: `边缘节点 ${String(index + 1).padStart(2, '0')}`,
      address: `10.10.1.${index + 10}`,
      status: index % 4 === 0 ? '离线' : '在线',
    })),
  );
  const filters = ref({ keyword: '', status: '' });
  const form = ref<Record<string, unknown>>({ name: '', address: '', status: '在线' });
  const columns: TableColumnData[] = [
    { title: '设备名称', dataIndex: 'name' },
    { title: 'IP 地址', dataIndex: 'address' },
    { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center' },
  ];

  const searchSchemas: JsonFormSchema<string>[] = [
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

  const formSchemas: JsonFormSchema<string>[] = [
    { field: 'name', label: '设备名称', type: 'input', required: true },
    { field: 'address', label: 'IP 地址', type: 'input', required: true },
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
  ];

  async function fetchDevices(params: Record<string, unknown>) {
    const keyword = String(params.keyword ?? '');
    const status = String(params.status ?? '');
    const current = Number(params.current ?? 1);
    const pageSize = Number(params.pageSize ?? 10);
    const filtered = devices.value.filter(
      (item) => (!keyword || item.name.includes(keyword)) && (!status || item.status === status),
    );
    const start = (current - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  }

  async function getDeviceDetail(row: Record<string, unknown>) {
    return devices.value.find((item) => item.id === row.id) ?? row;
  }

  async function createDevice(data: Record<string, unknown>) {
    const id = Date.now();
    devices.value = [
      {
        key: id,
        id,
        name: String(data.name),
        address: String(data.address),
        status: String(data.status),
      },
      ...devices.value,
    ];
  }

  async function updateDevice(data: Record<string, unknown>) {
    devices.value = devices.value.map((item) =>
      item.id === data.id
        ? {
            ...item,
            name: String(data.name),
            address: String(data.address),
            status: String(data.status),
          }
        : item,
    );
  }

  async function deleteDevice(row: Record<string, unknown>) {
    devices.value = devices.value.filter((item) => item.id !== row.id);
  }
</script>
