/** @jsxImportSource react */
import { Checkbox, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Checkbox value={'1'} disabled={true}>
          {'禁用选项 1'}
        </Checkbox>
        <Checkbox defaultChecked={true} disabled={true}>
          {'禁用选项 2'}
        </Checkbox>
      </Space>
    </>
  );
}
