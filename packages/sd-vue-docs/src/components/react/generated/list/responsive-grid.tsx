/** @jsxImportSource react */
import { List, ListItem } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const dataSource = [
    {
      title: '平台',
      data: ['iOS', 'Android', 'Web'],
    },
    {
      title: '框架',
      data: ['Angular', 'Vue', 'React'],
    },
    {
      title: '语言',
      data: ['C++', 'JavaScript', 'Python'],
    },
    {
      title: '组件',
      data: ['按钮', '面包屑', '穿梭框'],
    },
    {
      title: '设计',
      data: ['Figma', 'Sketch', 'Adobe XD'],
    },
    {
      title: '插件',
      data: ['Edu Tools', 'BashSupport', 'GitToolBox'],
    },
    {
      title: '平台',
      data: ['iOS', 'Android', 'Web'],
    },
    {
      title: '框架',
      data: ['Angular', 'Vue', 'React'],
    },
    {
      title: '语言',
      data: ['C++', 'JavaScript', 'Python'],
    },
  ];

  return (
    <>
      <List
        gridProps={{ gutter: [20, 20], sm: 24, md: 12, lg: 8, xl: 6 }}
        data={dataSource}
        bordered={false}
        renderItem={({ item }) => (
          <>
            <List
              data={item.data}
              header={<>{formatValue(item.title)}</>}
              renderItem={({ item: subItem }) => (
                <>
                  <ListItem>{formatValue(subItem)}</ListItem>
                </>
              )}
            />
          </>
        )}
      />
    </>
  );
}
