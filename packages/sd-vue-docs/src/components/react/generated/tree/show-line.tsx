/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Switch, Tree, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [showLine, setShowLine] = useState(true);
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 1',
      key: '0-0',
      children: [
        {
          title: '主干节点 1-0',
          key: '0-0-0',
          children: [
            { title: '叶子节点', key: '0-0-0-0' },
            {
              title: '叶子节点',
              key: '0-0-0-1',
              children: [{ title: '叶子节点', key: '0-0-0-1-0' }],
            },
            { title: '叶子节点', key: '0-0-0-2' },
          ],
        },
        {
          title: '主干节点 1-1',
          key: '0-0-1',
        },
        {
          title: '主干节点 1-2',
          key: '0-0-2',
          children: [
            { title: '叶子节点', key: '0-0-2-0' },
            {
              title: '叶子节点',
              key: '0-0-2-1',
            },
          ],
        },
      ],
    },
    {
      title: '主干节点 2',
      key: '0-1',
    },
    {
      title: '主干节点 3',
      key: '0-2',
      children: [
        {
          title: '主干节点 3-0',
          key: '0-2-0',
          children: [
            { title: '叶子节点', key: '0-2-0-0' },
            { title: '叶子节点', key: '0-2-0-1' },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <div>
          <TypographyText>{'showLine'}</TypographyText>
          <Switch
            value={showLine}
            onChange={(next) => setShowLine(next as typeof showLine)}
            className={'sd:ml-3'}
          />
        </div>
        <Tree defaultSelectedKeys={['0-0-1']} data={treeData} showLine={showLine} />
      </div>
    </>
  );
}
