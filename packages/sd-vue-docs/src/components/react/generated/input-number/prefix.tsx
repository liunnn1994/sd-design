/** @jsxImportSource react */
import { InputNumber, Space } from '@sdata/web-react';
import { IconInfoCircle, IconUser } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputNumber
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          allowClear={true}
          prefix={
            <>
              <IconUser />
            </>
          }
        />
        <InputNumber
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          allowClear={true}
          hideButton={true}
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
