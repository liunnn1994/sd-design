/** @jsxImportSource react */
import type { TreeNodeData, TreeNodeSwipeEventData } from '@sdata/web-react';

import { Tree } from '@sdata/web-react';
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
          title: '叶子节点 0-0-1',
          key: '0-0-1',
        },
      ],
    },
  ];
  const [latestEvent, setLatestEvent] = useState('暂未触发');
  function onNodeEvent(node: TreeNodeData, event: Event) {
    setLatestEvent(`${node.title} / ${event.type}`);
  }
  function onNodeSwipeEnd(node: TreeNodeData, event: TouchEvent, data: TreeNodeSwipeEventData) {
    setLatestEvent(`${node.title} / ${event.type} / ${data.direction}`);
  }

  return (
    <>
      <Tree
        data={treeData}
        onNodeClick={onNodeEvent}
        onNodeMouseover={onNodeEvent}
        onNodeLongPress={onNodeEvent}
        onNodeSwipeEnd={onNodeSwipeEnd}
      />
      <div className={'sd:mt-3'}>
        {'最近触发：'}
        {formatValue(latestEvent)}
      </div>
    </>
  );
}
