/** @jsxImportSource react */
import { Button, Form, FormItem, Input, Popconfirm } from '@sdata/web-react';

export default function Example() {
  const form = {};
  const handleBeforeOk = () =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 3000);
    });

  return (
    <>
      <Popconfirm
        onBeforeOk={handleBeforeOk}
        content={
          <>
            <Form model={form}>
              <FormItem label={'姓名'}>
                <Input />
              </FormItem>
              <FormItem label={'岗位'}>
                <Input />
              </FormItem>
            </Form>
          </>
        }
      >
        <Button>{'点击显示'}</Button>
      </Popconfirm>
    </>
  );
}
