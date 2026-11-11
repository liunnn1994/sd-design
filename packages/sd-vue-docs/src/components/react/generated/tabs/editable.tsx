/** @jsxImportSource react */
import { TabPane, Tabs } from '@sdata/web-react';
import { useRef } from 'react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const count = useRef(5);
  const [data, setData] = useState([
    {
      key: '1',
      title: '标签页 1',
      content: '标签页面板内容 1',
    },
    {
      key: '2',
      title: '标签页 2',
      content: '标签页面板内容 2',
    },
    {
      key: '3',
      title: '标签页 3',
      content: '标签页面板内容 3',
    },
    {
      key: '4',
      title: '标签页 4',
      content: '标签页面板内容 4',
    },
  ]);
  const handleAdd = () => {
    const number = count.current++;
    setData(
      data.concat({
        key: `${number}`,
        title: `新标签页 ${number}`,
        content: `新标签页面板内容 ${number}`,
      }),
    );
  };
  const handleDelete = (key: string | number) => {
    setData(data.filter((item) => item.key !== key));
  };

  return (
    <>
      <Tabs
        type={'card-gutter'}
        editable={true}
        onAdd={handleAdd}
        onDelete={handleDelete}
        showAddButton={true}
        autoSwitch={true}
      >
        {data.map((item, index) => (
          <TabPane key={item.key} title={item.title} closable={index !== 2}>
            {formatValue(item?.content)}
          </TabPane>
        ))}
      </Tabs>
    </>
  );
}
