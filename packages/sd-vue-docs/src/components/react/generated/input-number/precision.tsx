/** @jsxImportSource react */
import { InputNumber, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputNumber
          placeholder={'请输入'}
          defaultValue={3.6}
          step={1.2}
          precision={2}
          className={'input-demo sd:w-80'}
        />
        <InputNumber
          placeholder={'请输入'}
          defaultValue={1.22}
          step={1.22}
          precision={1}
          className={'input-demo sd:w-80'}
        />
      </Space>
    </>
  );
}
