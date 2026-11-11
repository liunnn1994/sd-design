/** @jsxImportSource react */
import type { TreeNodeData, TreeNodeKey } from '@sdata/web-react';

import { Checkbox, Tree } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const defaultTreeData = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '叶子节点 0-0-1',
          key: '0-0-1',
        },
        {
          title: '分支 0-0-2',
          key: '0-0-2',
          disableCheckbox: true,
          children: [
            {
              draggable: false,
              title: '叶子节点 0-0-2-1（禁止拖拽）',
              key: '0-0-2-1',
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
          checkable: false,
          children: [
            {
              title: '叶子节点 0-1-1-1',
              key: '0-1-1-1',
            },
            {
              title: '叶子节点 0-1-1-2',
              key: '0-1-1-2',
            },
          ],
        },
        {
          title: '叶子节点 0-1-2',
          key: '0-1-2',
        },
      ],
    },
  ];
  const [treeData, setTreeData] = useState<TreeNodeData[]>(defaultTreeData);
  const [checkedKeys, setCheckedKeys] = useState<TreeNodeKey[]>([]);
  const [checked, setChecked] = useState(false);
  function onDrop({
    dragNode,
    dropNode,
    dropPosition,
  }: {
    dragNode: TreeNodeData;
    dropNode: TreeNodeData;
    dropPosition: number;
  }) {
    const data = treeData;
    const loop = (
      data: TreeNodeData[],
      key: TreeNodeKey,
      callback: (item: TreeNodeData, index: number, arr: TreeNodeData[]) => void,
    ) => {
      data.some((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return true;
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
        return false;
      });
    };

    loop(data, dragNode.key ?? '', (_, index, arr) => {
      arr.splice(index, 1);
    });

    if (dropPosition === 0) {
      loop(data, dropNode.key ?? '', (item) => {
        item.children = item.children || [];
        item.children.push(dragNode);
      });
    } else {
      loop(data, dropNode.key ?? '', (_, index, arr) => {
        arr.splice(dropPosition < 0 ? index : index + 1, 0, dragNode);
      });
    }
  }

  return (
    <>
      <Checkbox
        data-v-f3ed3567=""
        modelValue={checked}
        onValueChange={(next) => setChecked(next as typeof checked)}
        className={'sd:mb-5'}
      >
        {' checkable '}
      </Checkbox>
      <Tree
        data-v-f3ed3567=""
        className={'tree-demo'}
        draggable={true}
        blockNode={true}
        checkable={checked}
        data={treeData}
        onDrop={onDrop}
      />
      <style>
        {
          '\n.tree-demo[data-v-f3ed3567] .tree-node-dropover > .sd-tree-node-title,\n  .tree-demo[data-v-f3ed3567] .tree-node-dropover > .sd-tree-node-title:hover {\n    animation: blinkBg-f3ed3567 0.4s 2;\n}\n@keyframes blinkBg-f3ed3567 {\n0% {\n      background-color: transparent;\n}\n100% {\n      background-color: var(--color-primary-light-1);\n}\n}\n'
        }
      </style>
    </>
  );
}
