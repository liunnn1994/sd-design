/** @jsxImportSource react */
import type { TreeNodeData, TreeSelectLoadMore } from '@sdata/web-react';

import { TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const defaultTreeData = [
    {
      key: 'node1',
      title: '节点 1',
      disabled: true,
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
      children: [
        {
          key: 'node4',
          title: '节点 4',
          isLeaf: true,
        },
        {
          key: 'node5',
          title: '节点 5',
          isLeaf: true,
        },
      ],
    },
  ];
  const [treeData, setTreeData] = useState<TreeNodeData[]>(defaultTreeData);
  const loadMore: TreeSelectLoadMore = (nodeData) => {
    const { title, key } = nodeData;
    const children = [
      { title: `${title}-0`, value: `${title}-0`, key: `${key}-0` },
      { title: `${title}-1`, value: `${title}-1`, key: `${key}-1` },
    ];

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        nodeData.children = children;
        resolve();
      }, 1000);
    });
  };

  return (
    <>
      <TreeSelect
        data={treeData}
        loadMore={loadMore}
        placeholder={'请选择…'}
        className={'sd:w-75'}
      />
    </>
  );
}
