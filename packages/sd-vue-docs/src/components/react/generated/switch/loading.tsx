/** @jsxImportSource react */
import { Space, Switch } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Switch loading={true} />
        <Switch type={'round'} loading={true} />
        <Switch type={'line'} loading={true} />
      </Space>
    </>
  );
}
