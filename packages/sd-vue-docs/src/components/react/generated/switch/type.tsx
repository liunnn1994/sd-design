/** @jsxImportSource react */
import { Space, Switch } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Switch />
        <Switch type={'round'} />
        <Switch type={'line'} />
      </Space>
    </>
  );
}
