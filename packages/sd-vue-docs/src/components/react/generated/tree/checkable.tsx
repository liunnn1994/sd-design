/** @jsxImportSource react */
import type { TreeNodeData, TreeNodeKey } from '@sdata/web-react';

import { Checkbox, Tree } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '叶子节点',
          key: '0-0-1',
        },
        {
          title: '分支 0-0-2',
          key: '0-0-2',
          disabled: true,
          children: [
            {
              title: '叶子节点',
              key: '0-0-2-1',
            },
            {
              title: '叶子节点',
              key: '0-0-2-2',
              disableCheckbox: true,
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
              title: '叶子节点 ',
              key: '0-1-1-1',
            },
            {
              title: '叶子节点 ',
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
  ];
  const [checkedKeys, setCheckedKeys] = useState<TreeNodeKey[]>([]);
  const [checkStrictly, setCheckStrictly] = useState(false);

  return (
    <>
      <Checkbox
        className={'sd:mb-6'}
        modelValue={checkStrictly}
        onValueChange={(next) => setCheckStrictly(next as typeof checkStrictly)}
        onChange={() => {
          setCheckedKeys([]);
        }}
      >
        {' checkStrictly '}
      </Checkbox>
      <Tree
        checkable={true}
        checkedKeys={checkedKeys}
        onCheckedKeysChange={(next) => setCheckedKeys(next as typeof checkedKeys)}
        checkStrictly={checkStrictly}
        data={treeData}
      />
    </>
  );
}
