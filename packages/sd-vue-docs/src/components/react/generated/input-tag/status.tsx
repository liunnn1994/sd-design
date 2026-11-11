/** @jsxImportSource react */
import { InputTag, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputTag
          defaultValue={['test']}
          className={'sd:w-80'}
          placeholder={'请输入'}
          disabled={true}
        />
        <InputTag
          defaultValue={['test']}
          className={'sd:w-80'}
          placeholder={'请输入'}
          readonly={true}
        />
        <InputTag
          defaultValue={['test']}
          className={'sd:w-80'}
          placeholder={'请输入'}
          error={true}
        />
      </Space>
    </>
  );
}
