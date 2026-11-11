/** @jsxImportSource react */
import { Radio, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Radio value={'radio'}>{'单选框'}</Radio>
        <Radio value={'disabled radio'} defaultChecked={true} disabled={true}>
          {'禁用单选框'}
        </Radio>
      </Space>
    </>
  );
}
