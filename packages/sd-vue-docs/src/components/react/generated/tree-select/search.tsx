/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Space, TreeSelect } from '@sdata/web-react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '分支 0-0-1',
          key: '0-0-1',
          children: [
            {
              title: '叶子节点 0-0-1-1',
              key: '0-0-1-1',
            },
            {
              title: '叶子节点 0-0-1-2',
              key: '0-0-1-2',
            },
          ],
        },
      ],
    },
    {
      title: '主干节点 0-1',
      key: '0-1',
      children: [
        {
          title: '分支 0-1-1',
          key: '0-1-1',
          children: [
            {
              title: '叶子节点 0-1-1-0',
              key: '0-1-1-0',
            },
          ],
        },
        {
          title: '分支 0-1-2',
          key: '0-1-2',
          children: [
            {
              title: '叶子节点 0-1-2-0',
              key: '0-1-2-0',
            },
          ],
        },
      ],
    },
  ];
  function filterTreeNode(searchValue: string, nodeData: TreeNodeData) {
    return (
      String(nodeData.title ?? '')
        .toLowerCase()
        .indexOf(searchValue.toLowerCase()) > -1
    );
  }

  return (
    <>
      <Space>
        <TreeSelect
          allowSearch={true}
          allowClear={true}
          data={treeData}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
        <TreeSelect
          allowSearch={true}
          allowClear={true}
          data={treeData}
          filterTreeNode={filterTreeNode}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
      </Space>
    </>
  );
}
