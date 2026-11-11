/** @jsxImportSource react */
import type { JsonFormSchema, TableColumnData } from '@sdata/web-react';

import { BasicCrudTable, Tag } from '@sdata/web-react';
import { useRef } from 'react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type Device = {
    key: number;
    id: number;
    name: string;
    address: string;
    status: string;
  };
  const devices = useRef<Device[]>(
    Array.from({ length: 28 }, (_, index) => ({
      key: index + 1,
      id: index + 1,
      name: `边缘节点 ${String(index + 1).padStart(2, '0')}`,
      address: `10.10.1.${index + 10}`,
      status: index % 4 === 0 ? '离线' : '在线',
    })),
  );
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [form, setForm] = useState<Record<string, unknown>>({
    name: '',
    address: '',
    status: '在线',
  });
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
    const filtered = devices.current.filter(
      (item) => (!keyword || item.name.includes(keyword)) && (!status || item.status === status),
    );
    const start = (current - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  }
  async function getDeviceDetail(row: Record<string, unknown>) {
    return devices.current.find((item) => item.id === row.id) ?? row;
  }
  async function createDevice(data: Record<string, unknown>) {
    const id = Date.now();
    devices.current = [
      {
        key: id,
        id,
        name: String(data.name),
        address: String(data.address),
        status: String(data.status),
      },
      ...devices.current,
    ];
  }
  async function updateDevice(data: Record<string, unknown>) {
    devices.current = devices.current.map((item) =>
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
    devices.current = devices.current.filter((item) => item.id !== row.id);
  }

  return (
    <>
      <div className={'sd:h-[520px]'}>
        <BasicCrudTable
          toolbarModel={filters}
          onToolbarModelChange={(next) => setFilters(next as typeof filters)}
          modalModel={form}
          onModalModelChange={(next) => setForm(next as typeof form)}
          fullHeight={true}
          title={'设备列表'}
          columns={columns}
          fetchTableApi={fetchDevices}
          createApi={createDevice}
          updateApi={updateDevice}
          detailApi={getDeviceDetail}
          deleteApi={deleteDevice}
          deleteNameKey={'name'}
          toolbarProps={{ schemas: searchSchemas }}
          modalFormProps={{ schemas: formSchemas }}
          slots={{
            table__status: ({ record: rawRecord }) => {
              const record = rawRecord as Device;
              return (
                <>
                  <Tag color={record.status === '在线' ? 'green' : 'red'}>
                    {formatValue(record.status)}
                  </Tag>
                </>
              );
            },
          }}
        />
      </div>
    </>
  );
}
