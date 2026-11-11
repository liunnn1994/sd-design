/** @jsxImportSource react */
import { Space, Tag } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const colors = [
    'red',
    'orangered',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'sdblue',
    'purple',
    'pinkpurple',
    'magenta',
    'gray',
  ];
  const custom = [
    '#f53f3f',
    '#7816ff',
    '#00b42a',
    '#165dff',
    '#ff7d00',
    '#eb0aa4',
    '#7bc616',
    '#86909c',
    '#b71de8',
    '#0fc6c2',
    '#ffb400',
    '#168cff',
    '#ff5722',
  ];

  return (
    <>
      <Space wrap={true}>
        <h3 className={'sd:py-2'}>{'内置颜色：'}</h3>
        {colors.map((color, index) => (
          <Tag key={index} color={color} closable={true}>
            {formatValue(color)}
          </Tag>
        ))}
      </Space>
      <h3 className={'sd:py-2'}>{'自定义颜色：'}</h3>
      <Space wrap={true}>
        {custom.map((color, index) => (
          <Tag key={index} color={color} closable={true}>
            {formatValue(color)}
          </Tag>
        ))}
      </Space>
    </>
  );
}
