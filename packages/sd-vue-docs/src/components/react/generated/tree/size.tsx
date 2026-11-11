/** @jsxImportSource react */
import type { Size, TreeNodeData } from '@sdata/web-react';

import { Radio, RadioGroup, Tree } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '分支 0-0-0',
          key: '0-0-0',
          children: [
            {
              title: '叶子节点',
              key: '0-0-0-0',
            },
            {
              title: '叶子节点',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: '分支 0-0-1',
          key: '0-0-1',
          children: [
            {
              title: '叶子节点',
              key: '0-0-1-0',
            },
          ],
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
      <Tree className={'sd:mr-5'} blockNode={true} checkable={true} size={size} data={treeData} />
    </>
  );
}
