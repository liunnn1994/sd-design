/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { InputSearch, Tree } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const originTreeData = [
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
  const [searchKey, setSearchKey] = useState('');
  const treeData = (() => {
    if (!searchKey) return originTreeData;
    return searchData(searchKey);
  })();
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

    return loop(originTreeData);
  }
  function getMatchIndex(title: string) {
    if (!searchKey) return -1;
    return title.toLowerCase().indexOf(searchKey.toLowerCase());
  }
  function getNodeTitle(nodeData?: TreeNodeData) {
    return String(nodeData?.title ?? '');
  }
  function getNodeMatchIndex(nodeData?: TreeNodeData) {
    return getMatchIndex(getNodeTitle(nodeData));
  }

  return (
    <>
      <div>
        <InputSearch
          className={'sd:max-w-60 sd:mb-2'}
          value={searchKey}
          onValueChange={(next) => setSearchKey(next as typeof searchKey)}
        />
        <Tree
          data={treeData}
          renderTitle={(nodeData) => (
            <>
              {getNodeMatchIndex(nodeData) < 0 ? (
                <>{formatValue(getNodeTitle(nodeData))}</>
              ) : (
                <span>
                  {formatValue(getNodeTitle(nodeData).slice(0, getNodeMatchIndex(nodeData)))}
                  <span className={'sd:text-[var(--color-primary-light-4)]'}>
                    {formatValue(
                      getNodeTitle(nodeData).slice(
                        getNodeMatchIndex(nodeData),
                        getNodeMatchIndex(nodeData) + searchKey.length,
                      ),
                    )}
                  </span>
                  {formatValue(
                    getNodeTitle(nodeData).slice(getNodeMatchIndex(nodeData) + searchKey.length),
                  )}
                </span>
              )}
            </>
          )}
        />
      </div>
    </>
  );
}
