/** @jsxImportSource react */
import type { TableColumnData, TableData } from '@sdata/web-react';

import { Input, Select, Table } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const options: Record<string, string[]> = {
    Beijing: ['海淀区', '朝阳区', '昌平区'],
    Sichuan: ['成都', '绵阳', '阿坝'],
    Guangdong: ['广州', '深圳', '汕头'],
  };
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name', slotName: 'name' },
    { title: '薪资', dataIndex: 'salary' },
    { title: '地址', dataIndex: 'address' },
    { title: '省份', dataIndex: 'province', slotName: 'province' },
    { title: '城市', dataIndex: 'city', slotName: 'city' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];
  const [data, setData] = useState<
    (TableData & { name: string; province?: string; city?: string })[]
  >([
    {
      key: '1',
      name: '王芳',
      salary: 23000,
      address: '示例路 32 号',
      province: '北京',
      city: '海淀区',
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
      province: '四川',
      city: '绵阳',
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
  const handleChange = (rowIndex: number) => {
    setData((previous) => {
      const draft = structuredClone(previous);
      draft[rowIndex].city = '';
      return draft;
    });
  };

  return (
    <>
      <Table
        columns={columns}
        data={data}
        cellSlots={{
          name: ({ rowIndex }) => (
            <>
              <Input
                value={data[rowIndex].name}
                onValueChange={(next) =>
                  setData((previous) => {
                    const draft = structuredClone(previous);
                    draft[rowIndex].name = next as (typeof data)[number]['name'];
                    return draft;
                  })
                }
              />
            </>
          ),
          province: ({ rowIndex }) => (
            <>
              <Select
                value={data[rowIndex].province}
                onValueChange={(next) =>
                  setData((previous) => {
                    const draft = structuredClone(previous);
                    draft[rowIndex].province = next as (typeof data)[number]['province'];
                    return draft;
                  })
                }
                options={Object.keys(options)}
                onChange={() => handleChange(rowIndex)}
              />
            </>
          ),
          city: ({ rowIndex }) => (
            <>
              <Select
                options={options[data[rowIndex].province ?? ''] || []}
                value={data[rowIndex].city}
                onValueChange={(next) =>
                  setData((previous) => {
                    const draft = structuredClone(previous);
                    draft[rowIndex].city = next as (typeof data)[number]['city'];
                    return draft;
                  })
                }
              />
            </>
          ),
        }}
      />
      <Table
        columns={columns}
        data={data}
        className={'sd:mt-5'}
        cellSlots={{
          name: ({ record: rawRecord, rowIndex }) => {
            const record = rawRecord as (typeof data)[number];
            return (
              <>
                <Input
                  value={record.name}
                  onValueChange={(next) =>
                    setData((previous) =>
                      previous.map((row, index) =>
                        index === rowIndex ? { ...row, name: next } : row,
                      ),
                    )
                  }
                />
              </>
            );
          },
          province: ({ record: rawRecord, rowIndex }) => {
            const record = rawRecord as (typeof data)[number];
            return (
              <>
                <Select
                  value={record.province}
                  onValueChange={(next) =>
                    setData((previous) =>
                      previous.map((row, index) =>
                        index === rowIndex
                          ? {
                              ...row,
                              province: typeof next === 'string' ? next : undefined,
                              city: '',
                            }
                          : row,
                      ),
                    )
                  }
                  options={Object.keys(options)}
                />
              </>
            );
          },
          city: ({ record: rawRecord, rowIndex }) => {
            const record = rawRecord as (typeof data)[number];
            return (
              <>
                <Select
                  options={options[record.province ?? ''] || []}
                  value={record.city}
                  onValueChange={(next) =>
                    setData((previous) =>
                      previous.map((row, index) =>
                        index === rowIndex
                          ? { ...row, city: typeof next === 'string' ? next : undefined }
                          : row,
                      ),
                    )
                  }
                />
              </>
            );
          },
        }}
      />
    </>
  );
}
