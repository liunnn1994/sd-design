/** @jsxImportSource react */
import type { TreeNodeData, TreeNodeKey } from '@sdata/web-react';

import { Checkbox, Tree, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [selectedKeys, setSelectedKeys] = useState<TreeNodeKey[]>([]);
  const [multiple, setMultiple] = useState(true);
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
      title: '主干节点 0-1',
      key: '0-1',
      children: [
        {
          title: '分支 0-1-1',
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
  ];

  return (
    <>
      <Checkbox
        className={'sd:mb-6'}
        modelValue={multiple}
        onValueChange={(next) => setMultiple(next as typeof multiple)}
        onChange={() => {
          setSelectedKeys([]);
        }}
      >
        {' 多选 '}
      </Checkbox>
      <br />
      <TypographyText>
        {' 当前项： '}
        {formatValue(selectedKeys?.join(' , '))}
      </TypographyText>
      <br />
      <Tree
        selectedKeys={selectedKeys}
        onSelectedKeysChange={(next) => setSelectedKeys(next as typeof selectedKeys)}
        multiple={multiple}
        data={treeData}
      />
    </>
  );
}
