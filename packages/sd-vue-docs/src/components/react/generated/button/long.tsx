/** @jsxImportSource react */
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space data-v-3769bf85="" className={'wrapper'} direction={'vertical'}>
        <Button data-v-3769bf85="" type={'primary'} long={true}>
          {'主要'}
        </Button>
        <Button data-v-3769bf85="" long={true}>
          {'默认'}
        </Button>
        <Button data-v-3769bf85="" type={'dashed'} long={true}>
          {'虚线'}
        </Button>
        <Button data-v-3769bf85="" type={'outline'} long={true}>
          {'描边'}
        </Button>
        <Button data-v-3769bf85="" type={'text'} long={true}>
          {'文本'}
        </Button>
      </Space>
      <style>
        {
          '.wrapper[data-v-3769bf85] {\n  width: 400px;\n  padding: 20px;\n  border: 1px solid var(--color-border);\n  border-radius: 4px;\n}'
        }
      </style>
    </>
  );
}
