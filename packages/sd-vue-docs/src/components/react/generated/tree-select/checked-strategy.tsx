/** @jsxImportSource react */
import type { CheckedStrategy, LabelValue, TreeNodeData } from '@sdata/web-react';

import { Radio, RadioGroup, TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
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
  const [treeCheckedStrategy, setTreeCheckedStrategy] = useState<CheckedStrategy>('all');

  return (
    <>
      <div className={'sd:mb-6'}>
        <RadioGroup
          type={'button'}
          value={treeCheckedStrategy}
          onValueChange={(next) => setTreeCheckedStrategy(next as typeof treeCheckedStrategy)}
          onChange={(value) => {
            setSelected([]);
          }}
        >
          {strategyOptions.map((item) => (
            <Radio key={item?.value} value={item?.value}>
              {formatValue(item?.label)}
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <TreeSelect
        value={selected}
        onValueChange={(next) => setSelected(next as typeof selected)}
        allowSearch={true}
        allowClear={true}
        treeCheckable={true}
        treeCheckedStrategy={treeCheckedStrategy}
        data={treeData}
        placeholder={'请选择…'}
        className={'sd:w-75'}
      />
    </>
  );
}
