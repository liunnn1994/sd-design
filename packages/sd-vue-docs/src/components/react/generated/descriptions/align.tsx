/** @jsxImportSource react */
import type { DescData } from '@sdata/web-react';

import { Descriptions, Space } from '@sdata/web-react';

export default function Example() {
  const data: DescData[] = [
    {
      label: '姓名',
      value: '苏格拉底',
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
      <Space direction={'vertical'} size={'large'}>
        <Descriptions data={data} title={'用户信息'} align={'right'} />
        <Descriptions data={data} title={'用户信息'} align={{ label: 'right' }} />
        <Descriptions data={data} title={'用户信息'} layout={'inline-vertical'} />
      </Space>
    </>
  );
}
