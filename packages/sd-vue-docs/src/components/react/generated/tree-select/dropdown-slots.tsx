/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Button, Checkbox, Form, FormItem, Switch, TreeSelect } from '@sdata/web-react';
import { IconCalendar } from '@sdata/web-react/icon';
import { createElement, useState } from 'react';

export default function Example() {
  const [form, setForm] = useState({
    empty: false,
    showHeaderOnEmpty: false,
    showFooterOnEmpty: false,
  });
  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      icon: () => createElement(IconCalendar, null),
      title: '主干节点',
      children: [
        {
          key: 'node2',
          title: '叶子节点',
        },
      ],
    },
    {
      key: 'node3',
      title: '主干节点 2',
      icon: () => createElement(IconCalendar, null),
      children: [
        {
          key: 'node4',
          title: '叶子节点',
        },
        {
          key: 'node5',
          title: '叶子节点',
        },
      ],
    },
    {
      key: 'node6',
      title: '主干节点 3',
      icon: () => createElement(IconCalendar, null),
      children: [
        {
          key: 'node7',
          title: '叶子节点',
        },
        {
          key: 'node8',
          title: '叶子节点',
        },
      ],
    },
  ];
  const computedTreeData = (() => {
    return form.empty ? [] : treeData;
  })();

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <Form layout={'inline'} model={form}>
          <FormItem label={'空状态'}>
            <Switch
              value={form.empty}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.empty = next as (typeof form)['empty'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'showHeaderOnEmpty'}>
            <Switch
              value={form.showHeaderOnEmpty}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.showHeaderOnEmpty = next as (typeof form)['showHeaderOnEmpty'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'showFooterOnEmpty'}>
            <Switch
              value={form.showFooterOnEmpty}
              onChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.showFooterOnEmpty = next as (typeof form)['showFooterOnEmpty'];
                  return draft;
                })
              }
            />
          </FormItem>
        </Form>
        <TreeSelect
          className={'sd:w-75'}
          placeholder={'请选择…'}
          data={computedTreeData}
          showHeaderOnEmpty={form.showHeaderOnEmpty}
          showFooterOnEmpty={form.showFooterOnEmpty}
          header={
            <>
              <div className={'sd:py-1.5 sd:px-3'}>
                <Checkbox value={'1'}>{'全部'}</Checkbox>
              </div>
            </>
          }
          footer={
            <>
              <div className={'sd:py-1.5 sd:text-center'}>
                <Button>{'点击我'}</Button>
              </div>
            </>
          }
        />
      </div>
    </>
  );
}
