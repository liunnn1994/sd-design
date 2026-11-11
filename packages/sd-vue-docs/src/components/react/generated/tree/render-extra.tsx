/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Tree } from '@sdata/web-react';
import { IconPlus } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [treeData, setTreeData] = useState<TreeNodeData[]>([
    {
      title: '主干节点',
      key: '0-0',
      children: [
        {
          title: '叶子节点',
          key: '0-0-1',
        },
        {
          title: '分支',
          key: '0-0-2',
          children: [
            {
              title: '叶子节点',
              key: '0-0-2-1',
            },
          ],
        },
      ],
    },
    {
      title: '主干节点',
      key: '0-1',
      children: [
        {
          title: '分支',
          key: '0-1-1',
          children: [
            {
              title: '叶子节点',
              key: '0-1-1-1',
            },
            {
              title: '叶子节点',
              key: '0-1-1-2',
            },
          ],
        },
        {
          title: '叶子节点',
          key: '0-1-2',
        },
      ],
    },
  ]);
  function onIconClick(nodeData: TreeNodeData) {
    const children = nodeData.children || [];
    children.push({
      title: '新树节点',
      key: `${nodeData.key}-${children.length + 1}`,
    });
    nodeData.children = children;
    setTreeData([...treeData]);
  }

  return (
    <>
      <div className={'sd:w-125 sd:p-0.5 sd:overflow-auto'}>
        <Tree
          blockNode={true}
          checkable={true}
          data={treeData}
          renderExtra={(nodeData) => (
            <>
              <IconPlus
                className={'sd:absolute sd:top-[10px] sd:right-2 sd:text-xs sd:text-[#3370ff]'}
                onClick={() => onIconClick(nodeData)}
              />
            </>
          )}
        />
      </div>
    </>
  );
}
