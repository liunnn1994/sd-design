/** @jsxImportSource react */
import type { CheckedStrategy, TreeNodeData, TreeNodeKey } from '@sdata/web-react';

import { Radio, RadioGroup, Tree, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

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
  const strategyOptions: Array<{ value: CheckedStrategy; label: string }> = [
    {
      value: 'all',
      label: '显示全部',
    },
    {
      value: 'parent',
      label: '显示父节点',
    },
    {
      value: 'child',
      label: '显示子节点',
    },
  ];
  const [checkedKeys, setCheckedKeys] = useState<TreeNodeKey[]>([]);
  const [checkedStrategy, setCheckedStrategy] = useState<CheckedStrategy>('all');

  return (
    <>
      <RadioGroup
        type={'button'}
        value={checkedStrategy}
        onValueChange={(next) => setCheckedStrategy(next as typeof checkedStrategy)}
        onChange={(value) => {
          setCheckedKeys([]);
        }}
      >
        {strategyOptions.map((item) => (
          <Radio key={item?.value} value={item?.value}>
            {formatValue(item?.label)}
          </Radio>
        ))}
      </RadioGroup>
      <br />
      <TypographyText className={'sd:my-6 sd:inline-block'}>
        {' 当前项： '}
        {formatValue(checkedKeys?.join(' , '))}
      </TypographyText>
      <br />
      <Tree
        checkable={true}
        checkedKeys={checkedKeys}
        onCheckedKeysChange={(next) => setCheckedKeys(next as typeof checkedKeys)}
        checkedStrategy={checkedStrategy}
        data={treeData}
      />
    </>
  );
}
