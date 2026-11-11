/** @jsxImportSource react */
import { Space, Switch } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Switch checkedText={<>{' 开 '}</>} uncheckedText={<>{' 关 '}</>} />
        <Switch type={'round'} checkedText={<>{' 开 '}</>} uncheckedText={<>{' 关 '}</>} />
      </Space>
    </>
  );
}
