/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { TreeSelect } from '@sdata/web-react';

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
      <TreeSelect
        defaultValue={'0-0-1'}
        fieldNames={{
          key: 'value',
          title: 'label',
          children: 'items',
        }}
        data={treeData}
        placeholder={'请选择…'}
        className={'sd:w-75'}
      />
    </>
  );
}
