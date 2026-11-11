/** @jsxImportSource react */
import { List, ListItem, Spin, Switch } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [current, setCurrent] = useState(1);
  const [bottom, setBottom] = useState(false);
  const [data, setData] = useState<string[]>([]);
  const [scrollbar, setScrollbar] = useState(true);
  const fetchData = () => {
    console.log('已滚动到底部！');
    if (current <= 5) {
      window.setTimeout(() => {
        const index = data.length;
        setData((previous) => {
          const next = [...previous];
          next.push(
            `示例科技有限公司 ${index + 1}`,
            `示例科技研发中心 ${index + 2}`,
            `示例数据有限公司 ${index + 3}`,
            `示例云服务有限公司 ${index + 4}`,
            `示例科技北京分公司 ${index + 5}`,
          );
          return next;
        });
        setCurrent((previous) => previous + 1);
      }, 2000);
    } else {
      setBottom(true);
    }
  };

  return (
    <>
      <div className={'sd:mb-2.5'}>
        <Switch value={scrollbar} onChange={(next) => setScrollbar(next as typeof scrollbar)} />
        {' 虚拟滚动条 '}
      </div>
      <List
        maxHeight={240}
        onReachBottom={fetchData}
        scrollbar={scrollbar}
        header={<>{' 列表标题 '}</>}
        scrollLoading={<>{bottom ? <div>{'没有更多数据'}</div> : <Spin />}</>}
      >
        {data.map((item) => (
          <ListItem>{formatValue(item)}</ListItem>
        ))}
      </List>
    </>
  );
}
