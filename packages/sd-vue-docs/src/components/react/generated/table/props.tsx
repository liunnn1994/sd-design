/** @jsxImportSource react */
import type { TableColumnData, TableData, TableRowSelection } from '@sdata/web-react';

import { Form, FormItem, Switch, Table } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [form, setForm] = useState({
    border: true,
    borderCell: false,
    hover: true,
    stripe: false,
    checkbox: true,
    loading: false,
    tableHeader: true,
    noData: false,
  });
  const [rowSelection, setRowSelection] = useState<TableRowSelection>({
    type: 'checkbox',
    showCheckedAll: true,
  });
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

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <Form layout={'inline'} model={form}>
          <FormItem label={'边框'} field={'border'}>
            <Switch
              value={form.border}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.border = next as (typeof form)['border'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'悬停'} field={'hover'}>
            <Switch
              value={form.hover}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.hover = next as (typeof form)['hover'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'斑马纹'} field={'stripe'}>
            <Switch
              value={form.stripe}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.stripe = next as (typeof form)['stripe'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'多选框'} field={'checkbox'}>
            <Switch
              value={form.checkbox}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.checkbox = next as (typeof form)['checkbox'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'checkAll'} field={'checkAll'}>
            <Switch
              value={rowSelection.showCheckedAll}
              onChange={(next) =>
                setRowSelection((previous) => {
                  const draft = structuredClone(previous);
                  draft.showCheckedAll = next as (typeof rowSelection)['showCheckedAll'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'加载中'} field={'loading'}>
            <Switch
              value={form.loading}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.loading = next as (typeof form)['loading'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'tableHeader'} field={'tableHeader'}>
            <Switch
              value={form.tableHeader}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.tableHeader = next as (typeof form)['tableHeader'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'noData'} field={'noData'}>
            <Switch
              value={form.noData}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.noData = next as (typeof form)['noData'];
                  return draft;
                })
              }
            />
          </FormItem>
        </Form>
        <Table
          columns={columns}
          data={form.noData ? [] : data}
          bordered={form.border}
          hoverable={form.hover}
          stripe={form.stripe}
          loading={form.loading}
          showHeader={form.tableHeader}
          rowSelection={form.checkbox ? rowSelection : undefined}
        />
      </div>
    </>
  );
}
