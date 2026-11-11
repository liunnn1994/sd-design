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

  return (
    <>
      <Space wrap={true}>
        <Tag bordered={true}>{'默认'}</Tag>
        {colors.map((color, index) => (
          <Tag key={index} color={color} bordered={true}>
            {formatValue(color)}
          </Tag>
        ))}
      </Space>
    </>
  );
}
