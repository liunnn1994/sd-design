/** @jsxImportSource react */
import { Mention, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-full'}>
        <Mention data={['研发团队', '设计团队', '产品团队']} placeholder={'输入 @'} />
        <Mention data={['研发团队', '设计团队', '产品团队']} prefix={'#'} placeholder={'输入 #'} />
        <Mention data={['研发团队', '设计团队', '产品团队']} prefix={'$'} placeholder={'输入 $'} />
      </Space>
    </>
  );
}
