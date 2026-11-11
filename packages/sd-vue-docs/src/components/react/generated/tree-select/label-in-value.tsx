/** @jsxImportSource react */
import type { TreeNodeData, TreeSelectChangeHandler } from '@sdata/web-react';

import { TreeSelect } from '@sdata/web-react';
import { IconCalendar } from '@sdata/web-react/icon';
import { createElement } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      icon: () => createElement(IconCalendar, null),
      title: '主干节点',
      disabled: true,
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
  ];
  function onChange(value: Parameters<TreeSelectChangeHandler>[0]) {
    console.log(value);
  }

  return (
    <>
      <TreeSelect
        data={treeData}
        labelInValue={true}
        defaultValue={{ value: 'node2', label: '叶子节点' }}
        placeholder={'请选择…'}
        className={'sd:w-75'}
        onChange={onChange}
      />
    </>
  );
}
