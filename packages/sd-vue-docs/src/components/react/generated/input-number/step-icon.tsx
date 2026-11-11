/** @jsxImportSource react */
import { InputNumber, Space } from '@sdata/web-react';
import { IconMinus, IconPlus } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputNumber
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          allowClear={true}
          plus={
            <>
              <IconPlus />
            </>
          }
          minus={
            <>
              <IconMinus />
            </>
          }
        />
      </Space>
    </>
  );
}
