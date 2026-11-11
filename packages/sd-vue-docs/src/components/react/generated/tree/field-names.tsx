/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Tree } from '@sdata/web-react';
import { IconDriveFile, IconStar } from '@sdata/web-react/icon';
import { createElement } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      label: '主干节点 0-0',
      value: '0-0',
      items: [
        {
          label: '分支 0-0-2',
          value: '0-0-2',
          selectable: false,
          customIcon: () => createElement(IconDriveFile, null),
          items: [
            {
              label: '叶子节点',
              value: '0-0-2-1',
              items: [
                {
                  label: '叶子节点 0-0-2',
                  value: '0-0-2-1-0',
                  items: [
                    {
                      label: '叶子节点',
                      customIcon: () => createElement(IconStar, null),
                      value: '0-0-2-1-0-0',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: '主干节点 0-1',
      value: '0-1',
      items: [
        {
          label: '分支 0-1-1',
          value: '0-1-1',
          items: [
            {
              label: '叶子节点',
              value: '0-1-1-0',
            },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <Tree
        defaultSelectedKeys={['0-0-1']}
        fieldNames={{
          key: 'value',
          title: 'label',
          children: 'items',
          icon: 'customIcon',
        }}
        data={treeData}
      />
    </>
  );
}
