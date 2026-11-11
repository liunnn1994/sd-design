/** @jsxImportSource react */
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Space>
          <Button type={'primary'} status={'success'}>
            {'主要'}
          </Button>
          <Button status={'success'}>{'默认'}</Button>
          <Button type={'dashed'} status={'success'}>
            {'虚线'}
          </Button>
          <Button type={'outline'} status={'success'}>
            {'描边'}
          </Button>
          <Button type={'text'} status={'success'}>
            {'文本'}
          </Button>
        </Space>
        <Space>
          <Button type={'primary'} status={'warning'}>
            {'主要'}
          </Button>
          <Button status={'warning'}>{'默认'}</Button>
          <Button type={'dashed'} status={'warning'}>
            {'虚线'}
          </Button>
          <Button type={'outline'} status={'warning'}>
            {'描边'}
          </Button>
          <Button type={'text'} status={'warning'}>
            {'文本'}
          </Button>
        </Space>
        <Space>
          <Button type={'primary'} status={'danger'}>
            {'主要'}
          </Button>
          <Button status={'danger'}>{'默认'}</Button>
          <Button type={'dashed'} status={'danger'}>
            {'虚线'}
          </Button>
          <Button type={'outline'} status={'danger'}>
            {'描边'}
          </Button>
          <Button type={'text'} status={'danger'}>
            {'文本'}
          </Button>
        </Space>
      </Space>
    </>
  );
}
