/** @jsxImportSource react */
import type { TransferItem, TreeNodeData } from '@sdata/web-react';

import { Transfer, Tree } from '@sdata/web-react';

export default function Example() {
  const treeData = [
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
            {
              title: '叶子节点 0-0-2-2',
              key: '0-0-2-2',
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
  const getTransferData = (
    treeData: TreeNodeData[] = [],
    transferDataSource: TransferItem[] = [],
  ) => {
    treeData.forEach((item) => {
      if (item.children) getTransferData(item.children, transferDataSource);
      else
        transferDataSource.push({ label: String(item.title ?? ''), value: String(item.key ?? '') });
    });
    return transferDataSource;
  };
  const getTreeData = (data: TransferItem[] = []) => {
    const values = data.map((item) => item.value);

    const travel = (_treeData: TreeNodeData[] = []) => {
      const treeDataSource: TreeNodeData[] = [];
      _treeData.forEach((item) => {
        if (item.children || (item.key !== undefined && values.includes(String(item.key)))) {
          treeDataSource.push({
            title: String(item.title ?? ''),
            key: item.key ?? '',
            children: travel(item.children),
          });
        }
      });
      return treeDataSource;
    };

    return travel(treeData);
  };
  const transferData = getTransferData(treeData);
  const value = ['0-0-2-1'];

  return (
    <>
      <Transfer
        data={transferData}
        defaultValue={value}
        renderSource={({ data, selectedKeys, onSelect }) => (
          <>
            <Tree
              checkable={true}
              checkedStrategy={'child'}
              checkedKeys={selectedKeys}
              data={getTreeData(data)}
              onCheck={(keys: (string | number)[]) => onSelect?.(keys.map(String))}
            />
          </>
        )}
      />
    </>
  );
}
