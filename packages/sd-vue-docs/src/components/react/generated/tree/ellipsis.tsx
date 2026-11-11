/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Tree } from '@sdata/web-react';

export default function Example() {
  const longTitle =
    '这是一段很长的树节点标题，用来展示节点标题开启 Ellipsis 后在有限宽度内的省略效果';
  const treeData: TreeNodeData[] = [
    {
      title: longTitle,
      key: '0-0',
      children: [
        {
          title: `${longTitle} - 子节点`,
          key: '0-0-0',
        },
      ],
    },
  ];

  return (
    <>
      <div data-v-ee78fa9c="" className={'tree-ellipsis-demo'}>
        <Tree data-v-ee78fa9c="" blockNode={true} ellipsis={true} data={treeData} />
        <Tree
          data-v-ee78fa9c=""
          blockNode={true}
          ellipsis={'performant-ellipsis'}
          data={treeData}
        />
      </div>
      <style>
        {
          '\n.tree-ellipsis-demo[data-v-ee78fa9c] {\n    display: grid;\n    grid-template-columns: repeat(2, minmax(0, 240px));\n    gap: 16px;\n}\n'
        }
      </style>
    </>
  );
}
