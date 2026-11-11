/** @jsxImportSource react */
import type { LabelValue, TreeNodeData } from '@sdata/web-react';

import { Checkbox, TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      value: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '叶子节点 0-0-1',
          value: '叶子节点 0-0-1',
          key: '0-0-1',
        },
        {
          title: '分支 0-0-2',
          value: '分支 0-0-2',
          key: '0-0-2',
          children: [
            {
              title: '叶子节点 0-0-2-1',
              value: '叶子节点 0-0-2-1',
              key: '0-0-2-1',
            },
          ],
        },
      ],
    },
    {
      title: '主干节点 0-1',
      value: '主干节点 0-1',
      key: '0-1',
      children: [
        {
          title: '分支 0-1-1',
          value: '分支 0-1-1',
          key: '0-1-1',
          checkable: false,
          children: [
            {
              title: '叶子节点 0-1-1-1',
              value: '叶子节点 0-1-1-1',
              key: '0-1-1-1',
            },
            {
              title: '叶子节点 0-1-1-2',
              value: '叶子节点 0-1-1-2',
              key: '0-1-1-2',
              disabled: true,
            },
          ],
        },
        {
          title: '叶子节点 0-1-2',
          value: '叶子节点 0-1-2',
          key: '0-1-2',
        },
      ],
    },
  ];
  const [selected, setSelected] = useState<LabelValue[]>([]);
  const [treeCheckStrictly, setTreeCheckStrictly] = useState(false);

  return (
    <>
      <div className={'sd:mb-6'}>
        <Checkbox
          modelValue={treeCheckStrictly}
          onValueChange={(next) => setTreeCheckStrictly(next as typeof treeCheckStrictly)}
          onChange={() => {
            setSelected([]);
          }}
        >
          {' treeCheckStrictly '}
        </Checkbox>
      </div>
      <TreeSelect
        value={selected}
        onValueChange={(next) => setSelected(next as typeof selected)}
        allowSearch={true}
        allowClear={true}
        treeCheckable={true}
        treeCheckStrictly={treeCheckStrictly}
        data={treeData}
        placeholder={'请选择…'}
        className={'sd:w-75'}
      />
    </>
  );
}
