/** @jsxImportSource react */
import type { JsonFormSchema, TableColumnData } from '@sdata/web-react';

import { BasicCrudTable, Button } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  interface Device {
    key: number;
    id: number;
    name: string;
    status: string;
    ip: string;
  }
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [form, setForm] = useState<Record<string, unknown>>({ name: '', status: '在线', ip: '' });
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
  const [devices, setDevices] = useState<Device[]>([
    { key: 1, id: 1, name: '边缘节点 A', status: '在线', ip: '10.0.0.1' },
    { key: 2, id: 2, name: '边缘节点 B', status: '离线', ip: '10.0.0.2' },
    { key: 3, id: 3, name: '边缘节点 C', status: '在线', ip: '10.0.0.3' },
  ]);
  async function fetchDevices(params: Record<string, unknown>) {
    const keyword = String(params.keyword ?? '');
    const status = String(params.status ?? '');
    const data = devices.filter(
      (item) => (!keyword || item.name.includes(keyword)) && (!status || item.status === status),
    );
    return { data, total: data.length };
  }
  async function createDevice(data: Record<string, unknown>) {
    const id = Date.now();
    setDevices([
      ...devices,
      {
        key: id,
        id,
        name: String(data.name),
        status: String(data.status),
        ip: String(data.ip ?? ''),
      },
    ]);
  }
  async function updateDevice(data: Record<string, unknown>) {
    setDevices(
      devices.map((item) =>
        item.id === data.id
          ? {
              ...item,
              name: String(data.name),
              status: String(data.status),
              ip: String(data.ip ?? ''),
            }
          : item,
      ),
    );
  }
  async function deleteDevice(row: Record<string, unknown>) {
    setDevices(devices.filter((item) => item.id !== row.id));
  }

  return (
    <>
      <BasicCrudTable
        toolbarModel={filters}
        onToolbarModelChange={(next) => setFilters(next as typeof filters)}
        modalModel={form}
        onModalModelChange={(next) => setForm(next as typeof form)}
        title={'设备列表'}
        columns={columns}
        fetchTableApi={fetchDevices}
        createApi={createDevice}
        updateApi={updateDevice}
        deleteApi={deleteDevice}
        deleteNameKey={'name'}
        toolbarProps={{ schemas, allowExpand: true }}
        modalFormProps={{ schemas: formSchemas }}
        slots={{
          toolbar__action_middle: () => (
            <>
              <Button>{'批量导入'}</Button>
            </>
          ),
          toolbar__action_append: () => (
            <>
              <Button>{'导出'}</Button>
            </>
          ),
        }}
      />
    </>
  );
}
