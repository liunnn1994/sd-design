/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Tree } from '@sdata/web-react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '分支 0-0-0',
          key: '0-0-0',
          children: [
            {
              title: '叶子节点',
              key: '0-0-0-0',
            },
            {
              title: '叶子节点',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: '分支 0-0-1',
          key: '0-0-1',
          children: [
            {
              title: '叶子节点',
              key: '0-0-1-0',
            },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <Tree blockNode={true} data={treeData} />
    </>
  );
}
