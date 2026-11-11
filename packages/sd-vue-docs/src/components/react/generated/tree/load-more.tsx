/** @jsxImportSource react */
import type { LoadMore, TreeNodeData } from '@sdata/web-react';

import { Tree } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [treeData, setTreeData] = useState<TreeNodeData[]>([
    {
      title: '主干节点 0-0',
      key: '0-0',
    },
    {
      title: '主干节点 0-1',
      key: '0-1',
      children: [
        {
          title: '分支 0-1-1',
          key: '0-1-1',
        },
      ],
    },
  ]);
  const loadMore: LoadMore = (nodeData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        nodeData.children = [{ title: `叶子节点`, key: `${nodeData.key}-1`, isLeaf: true }];
        resolve();
      }, 1000);
    });
  };

  return (
    <>
      <Tree data={treeData} loadMore={loadMore} />
    </>
  );
}
