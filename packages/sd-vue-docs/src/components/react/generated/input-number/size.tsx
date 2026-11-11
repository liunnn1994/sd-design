/** @jsxImportSource react */
import { InputNumber, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputNumber placeholder={'请输入'} size={'large'} className={'input-demo sd:w-80'} />
        <InputNumber
          placeholder={'请输入'}
          mode={'button'}
          size={'large'}
          className={'input-demo sd:w-80'}
        />
      </Space>
    </>
  );
}
