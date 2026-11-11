/** @jsxImportSource react */
import type { TreeNodeData, TreeNodeKey } from '@sdata/web-react';

import { Space, TreeSelect } from '@sdata/web-react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      title: '主干节点 1',
      children: [
        {
          key: 'node2',
          title: '叶子节点 1',
        },
      ],
    },
    {
      key: 'node3',
      title: '主干节点 2',
      children: [
        {
          key: 'node4',
          title: '叶子节点 2',
        },
        {
          key: 'node5',
          title: '叶子节点 3',
        },
      ],
    },
  ];
  function fallback(key: TreeNodeKey) {
    return {
      key,
      title: `++${key}++`,
    };
  }

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <TreeSelect
          defaultValue={'node0'}
          data={treeData}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
        <TreeSelect
          defaultValue={'node0'}
          data={treeData}
          fallbackOption={false}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
        <TreeSelect
          defaultValue={'node0'}
          data={treeData}
          fallbackOption={fallback}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
        <TreeSelect
          defaultValue={['node0', 'node2']}
          data={treeData}
          multiple={true}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
        <TreeSelect
          defaultValue={['node0', 'node2']}
          data={treeData}
          fallbackOption={false}
          multiple={true}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
        <TreeSelect
          defaultValue={['node0', 'node2']}
          data={treeData}
          fallbackOption={fallback}
          multiple={true}
          placeholder={'请选择…'}
          className={'sd:w-75'}
        />
      </Space>
    </>
  );
}
