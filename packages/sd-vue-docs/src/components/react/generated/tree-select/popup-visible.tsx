/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { Button, TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      title: '主干节点',
      children: [
        {
          key: 'node2',
          title: '叶子节点',
        },
      ],
    },
    {
      key: 'node3',
      title: '主干节点 2',
      children: [
        {
          key: 'node4',
          title: '叶子节点',
        },
        {
          key: 'node5',
          title: '叶子节点',
        },
      ],
    },
  ];
  const [popupVisible, setPopupVisible] = useState(false);
  function onClick() {
    setPopupVisible(!popupVisible);
  }

  return (
    <>
      <div className={'sd:mb-6'}>
        <Button type={'primary'} onClick={onClick}>
          {'切换'}
        </Button>
      </div>
      <TreeSelect
        popupVisible={popupVisible}
        allowClear={true}
        data={treeData}
        placeholder={'请选择…'}
        className={'sd:w-75'}
      />
    </>
  );
}
