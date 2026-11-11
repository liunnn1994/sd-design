/** @jsxImportSource react */
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Space>
          <Button type={'primary'} disabled={true}>
            {'主要'}
          </Button>
          <Button disabled={true}>{'默认'}</Button>
          <Button type={'dashed'} disabled={true}>
            {'虚线'}
          </Button>
          <Button type={'outline'} disabled={true}>
            {'描边'}
          </Button>
          <Button type={'text'} disabled={true}>
            {'文本'}
          </Button>
        </Space>
        <Space>
          <Button type={'primary'} status={'success'} disabled={true}>
            {'主要'}
          </Button>
          <Button status={'success'} disabled={true}>
            {'默认'}
          </Button>
          <Button type={'dashed'} status={'success'} disabled={true}>
            {'虚线'}
          </Button>
          <Button type={'outline'} status={'success'} disabled={true}>
            {'描边'}
          </Button>
          <Button type={'text'} status={'success'} disabled={true}>
            {'文本'}
          </Button>
        </Space>
        <Space>
          <Button type={'primary'} status={'warning'} disabled={true}>
            {'主要'}
          </Button>
          <Button status={'warning'} disabled={true}>
            {'默认'}
          </Button>
          <Button type={'dashed'} status={'warning'} disabled={true}>
            {'虚线'}
          </Button>
          <Button type={'outline'} status={'warning'} disabled={true}>
            {'描边'}
          </Button>
          <Button type={'text'} status={'warning'} disabled={true}>
            {'文本'}
          </Button>
        </Space>
        <Space>
          <Button type={'primary'} status={'danger'} disabled={true}>
            {'主要'}
          </Button>
          <Button status={'danger'} disabled={true}>
            {'默认'}
          </Button>
          <Button type={'dashed'} status={'danger'} disabled={true}>
            {'虚线'}
          </Button>
          <Button type={'outline'} status={'danger'} disabled={true}>
            {'描边'}
          </Button>
          <Button type={'text'} status={'danger'} disabled={true}>
            {'文本'}
          </Button>
        </Space>
      </Space>
    </>
  );
}
