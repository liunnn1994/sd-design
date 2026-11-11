/** @jsxImportSource react */
import type { DescData } from '@sdata/web-react';

import { Descriptions, DescriptionsItem, Space, Tag } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const data: DescData[] = [
    {
      label: '姓名',
      value: '苏格拉底',
      span: 3,
    },
    {
      label: '手机',
      value: '123-1234-1234',
    },
    {
      label: '居住地',
      value: '北京',
    },
    {
      label: '家乡',
      value: '北京',
    },
    {
      label: '地址',
      value: '北京市知春路示例大厦',
    },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'} fill={true}>
        <Descriptions data={data} title={'用户信息'} layout={'inline-horizontal'} />
        <Descriptions title={'用户信息'} column={{ xs: 1, md: 3, lg: 4 }}>
          {data.map((item) => (
            <DescriptionsItem
              label={typeof item.label === 'string' ? item.label : undefined}
              span={item.span ?? 1}
            >
              <Tag>{formatValue(item.value)}</Tag>
            </DescriptionsItem>
          ))}
        </Descriptions>
      </Space>
    </>
  );
}
