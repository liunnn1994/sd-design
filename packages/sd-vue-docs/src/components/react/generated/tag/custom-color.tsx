/** @jsxImportSource react */
import { Divider, Space, Tag } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const darkColors = ['#f53f3f', '#7816ff', '#165dff', '#ff7d00', '#00b42a', '#b71de8'];
  const lightColors = ['#ffb400', '#0fc6c2', '#7bc616', '#ffb7c5', '#bfd4ff', '#e8b4fd'];
  const alphas = [0.1, 0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <>
      <Space direction={'vertical'} size={16}>
        <Space wrap={true}>
          {darkColors.map((color, index) => (
            <Tag key={index} color={color} bordered={true}>
              {formatValue(color)}
            </Tag>
          ))}
        </Space>
        <Space wrap={true}>
          {lightColors.map((color, index) => (
            <Tag key={index} color={color} bordered={true}>
              {formatValue(color)}
            </Tag>
          ))}
        </Space>
        <Divider />
        <Space wrap={true}>
          <Tag color={'#ff5722'} textColor={'#000000'} bordered={true}>
            {' textColor="#000000" '}
          </Tag>
          <Tag color={'#ff5722'} textColor={'#FFFFFF'} bordered={true}>
            {' textColor="#FFFFFF" '}
          </Tag>
        </Space>
        <Divider />
        <Space wrap={true}>
          {alphas.map((alpha) => (
            <Tag key={alpha} color={'#165dff'} backgroundAlpha={alpha} bordered={true}>
              {' alpha='}
              {formatValue(alpha)}
            </Tag>
          ))}
        </Space>
      </Space>
    </>
  );
}
