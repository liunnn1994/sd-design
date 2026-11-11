/** @jsxImportSource react */
import type { LabelValue, TreeNodeData } from '@sdata/web-react';

import { Space, TreeSelect } from '@sdata/web-react';
import { IconCalendar } from '@sdata/web-react/icon';
import { createElement, useState } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      icon: () => createElement(IconCalendar, null),
      title: '节点 1',
      children: [
        {
          key: 'node2',
          title: '节点 2',
        },
      ],
    },
    {
      key: 'node3',
      title: '节点 3',
      icon: () => createElement(IconCalendar, null),
      children: [
        {
          key: 'node4',
          title: '节点 4',
        },
        {
          key: 'node5',
          title: '节点 5',
        },
      ],
    },
  ];
  const [selected, setSelected] = useState<LabelValue[]>([]);

  return (
    <>
      <Space>
        <TreeSelect
          value={selected}
          onValueChange={(next) => setSelected(next as typeof selected)}
          multiple={true}
          allowClear={true}
          allowSearch={true}
          data={treeData}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
        <TreeSelect
          value={selected}
          onValueChange={(next) => setSelected(next as typeof selected)}
          multiple={true}
          maxTagCount={2}
          allowClear={true}
          allowSearch={true}
          data={treeData}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
      </Space>
    </>
  );
}
