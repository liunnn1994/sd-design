/** @jsxImportSource react */
import { Input, Space } from '@sdata/web-react';
import { IconInfoCircle, IconUser } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Input
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          allowClear={true}
          prefix={
            <>
              <IconUser />
            </>
          }
        />
        <Input
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          allowClear={true}
          suffix={
            <>
              <IconInfoCircle />
            </>
          }
        />
      </Space>
    </>
  );
}
