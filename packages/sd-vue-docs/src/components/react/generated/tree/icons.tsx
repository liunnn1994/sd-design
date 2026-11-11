/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Tree } from '@sdata/web-react';
import { IconDown, IconDriveFile, IconStar } from '@sdata/web-react/icon';
import { createElement } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点',
      key: 'node1',
      children: [
        {
          title: '叶子节点',
          key: 'node2',
        },
      ],
    },
    {
      title: '主干节点',
      key: 'node3',
      children: [
        {
          title: '叶子节点',
          key: 'node4',
          switcherIcon: () => createElement(IconDriveFile, null),
        },
        {
          title: '叶子节点',
          key: 'node5',
          switcherIcon: () => createElement(IconDriveFile, null),
        },
      ],
    },
  ];

  return (
    <>
      <Tree
        data={treeData}
        showLine={true}
        renderSwitcherIcon={({ isLeaf }) => (
          <>
            {!isLeaf ? <IconDown /> : null}
            {isLeaf ? <IconStar /> : null}
          </>
        )}
      />
    </>
  );
}
