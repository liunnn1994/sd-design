/** @jsxImportSource react */
import { Space, Switch } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Switch disabled={true} />
        <Switch defaultChecked={true} disabled={true} />
        <Switch type={'round'} disabled={true} />
        <Switch defaultChecked={true} type={'round'} disabled={true} />
        <Switch type={'line'} disabled={true} />
        <Switch defaultChecked={true} type={'line'} disabled={true} />
      </Space>
    </>
  );
}
