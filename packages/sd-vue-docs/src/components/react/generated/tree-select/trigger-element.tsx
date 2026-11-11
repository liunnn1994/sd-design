/** @jsxImportSource react */
import type { TreeNodeData } from '@sdata/web-react';

import { TreeSelect, TypographyParagraph } from '@sdata/web-react';

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
      key: 'node1',
      title: '节点 1',
      children: [
        {
          key: 'node2',
          title: '节点 2',
        },
      ],
    },
    {
      key: 'node3',
      title: '节点 3',
      children: [
        {
          key: 'node4',
          title: '节点 4',
        },
        {
          key: 'node5',
          title: '节点 5',
          children: [
            {
              key: 'node6',
              title: '节点 6',
            },
            {
              key: 'node7',
              title: '节点 7',
            },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <TreeSelect
        data={treeData}
        defaultValue={'node1'}
        renderTrigger={({ displayValue, selectedOptions, popupVisible }) => (
          <>
            <TypographyParagraph className={'sd:w-75'}>
              {' 已选择： '}
              <a href={'javascript: void(0)'}>{formatValue(displayValue || '未选择')}</a>
              {' （'}
              {formatValue(selectedOptions.length)}
              {' 项，'}
              {formatValue(popupVisible ? '收起' : '展开')}
              {'） '}
            </TypographyParagraph>
          </>
        )}
      />
    </>
  );
}
