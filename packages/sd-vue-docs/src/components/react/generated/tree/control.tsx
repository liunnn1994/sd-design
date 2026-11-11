/** @jsxImportSource react */
import type {
  TreeCheckHandler,
  TreeExpandHandler,
  TreeNodeData,
  TreeNodeKey,
  TreeSelectHandler,
} from '@sdata/web-react';

import { Button, ButtonGroup, Tree } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const allCheckedKeys = ['0-0', '0-0-1', '0-0-2', '0-0-2-1', '0-1', '0-1-1', '0-1-2'];
  const allExpandedKeys = ['0-0', '0-1', '0-0-2'];
  const treeData: TreeNodeData[] = [
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
          children: [
            {
              title: '叶子节点 0-0-2-1',
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
          title: '叶子节点 0-1-1',
          key: '0-1-1',
        },
        {
          title: '叶子节点 0-1-2',
          key: '0-1-2',
        },
      ],
    },
  ];
  const [selectedKeys, setSelectedKeys] = useState<TreeNodeKey[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeNodeKey[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<TreeNodeKey[]>([]);
  function toggleChecked() {
    setCheckedKeys(checkedKeys.length ? [] : allCheckedKeys);
  }
  function toggleExpanded() {
    setExpandedKeys(expandedKeys.length ? [] : allExpandedKeys);
  }
  function onSelect(
    newSelectedKeys: Parameters<TreeSelectHandler>[0],
    event: Parameters<TreeSelectHandler>[1],
  ) {
    console.log('select: ', newSelectedKeys, event);
  }
  function onCheck(
    newCheckedKeys: Parameters<TreeCheckHandler>[0],
    event: Parameters<TreeCheckHandler>[1],
  ) {
    console.log('check: ', newCheckedKeys, event);
  }
  function onExpand(
    newExpandedKeys: Parameters<TreeExpandHandler>[0],
    event: { expanded?: boolean; expandedNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event },
  ) {
    console.log('expand: ', newExpandedKeys, event);
  }

  return (
    <>
      <ButtonGroup className={'sd:mb-5'}>
        <Button type={'primary'} onClick={toggleChecked}>
          {formatValue(checkedKeys?.length ? 'deselect all' : 'select all')}
        </Button>
        <Button type={'primary'} onClick={toggleExpanded}>
          {formatValue(expandedKeys?.length ? 'fold' : 'unfold')}
        </Button>
      </ButtonGroup>
      <Tree
        checkable={true}
        selectedKeys={selectedKeys}
        onSelectedKeysChange={(next) => setSelectedKeys(next as typeof selectedKeys)}
        checkedKeys={checkedKeys}
        onCheckedKeysChange={(next) => setCheckedKeys(next as typeof checkedKeys)}
        expandedKeys={expandedKeys}
        onExpandedKeysChange={(next) => setExpandedKeys(next as typeof expandedKeys)}
        onSelect={onSelect}
        onCheck={onCheck}
        onExpand={onExpand}
        data={treeData}
      />
    </>
  );
}
