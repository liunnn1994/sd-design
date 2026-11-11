/** @jsxImportSource react */
import { Space, Statistic } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Statistic title={'下载量'} value={125670} showGroupSeparator={true} />
        <Statistic extra={'Comments'} value={40509} precision={2} />
      </Space>
    </>
  );
}
