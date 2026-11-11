/** @jsxImportSource react */
import type { TreeNodeData, TreeSelectSearchHandler } from '@sdata/web-react';

import { TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const defaultTreeData = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '分支 0-0-1',
          key: '0-0-1',
          children: [
            {
              title: '叶子节点 0-0-1-1',
              key: '0-0-1-1',
            },
            {
              title: '叶子节点 0-0-1-2',
              key: '0-0-1-2',
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
              title: '叶子节点 0-1-1-0',
              key: '0-1-1-0',
            },
          ],
        },
        {
          title: '分支 0-1-2',
          key: '0-1-2',
          children: [
            {
              title: '叶子节点 0-1-2-0',
              key: '0-1-2-0',
            },
          ],
        },
      ],
    },
  ];
  const [treeData, setTreeData] = useState<TreeNodeData[]>(defaultTreeData);
  const [loading, setLoading] = useState(false);
  function searchData(keyword: string) {
    const loop = (data: TreeNodeData[]): TreeNodeData[] => {
      const result: TreeNodeData[] = [];
      data.forEach((item) => {
        if (
          String(item.title ?? '')
            .toLowerCase()
            .indexOf(keyword.toLowerCase()) > -1
        ) {
          result.push({ ...item });
        } else if (item.children) {
          const filterData = loop(item.children);
          if (filterData.length) {
            result.push({
              ...item,
              children: filterData,
            });
          }
        }
      });
      return result;
    };

    return loop(defaultTreeData);
  }
  const onSearch: TreeSelectSearchHandler = (searchKey) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTreeData(searchData(searchKey));
    }, 200);
  };

  return (
    <>
      <TreeSelect
        allowSearch={true}
        allowClear={true}
        disableFilter={true}
        data={treeData}
        loading={loading}
        className={'sd:w-75'}
        placeholder={'请选择…'}
        onSearch={onSearch}
      />
    </>
  );
}
