/** @jsxImportSource react */
import type { Size, TreeNodeData } from '@sdata/web-react';

import { Radio, RadioGroup, TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      title: '节点 1',
      disabled: true,
      children: [
        {
          key: 'node2',
          title: '节点 2',
        },
      ],
    },
    {
      key: 'node3',
      title: '节点 3',
      children: [
        {
          key: 'node4',
          title: '节点 4',
          isLeaf: true,
        },
        {
          key: 'node5',
          title: '节点 5',
          isLeaf: true,
        },
      ],
    },
  ];
  const [size, setSize] = useState<Size>('medium');

  return (
    <>
      <div className={'sd:mb-5'}>
        <RadioGroup
          value={size}
          onValueChange={(next) => setSize(next as typeof size)}
          type={'button'}
        >
          <Radio value={'mini'}>{'迷你'}</Radio>
          <Radio value={'small'}>{'小'}</Radio>
          <Radio value={'medium'}>{'中'}</Radio>
          <Radio value={'large'}>{'大'}</Radio>
        </RadioGroup>
      </div>
      <TreeSelect
        defaultValue={'node1'}
        size={size}
        data={treeData}
        placeholder={'请选择…'}
        className={'sd:w-75'}
      />
    </>
  );
}
