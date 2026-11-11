/** @jsxImportSource react */
import type { FormInstance } from '@sdata/web-react';

import { Button, Form, FormItem, Input, Space } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

export default function Example() {
  const formRef = useRef<ComponentRef<typeof Form> | null>(null);
  const fieldCount = 20;
  const fieldNames = Array.from({ length: fieldCount }, (_, index) => `name${index}`);
  const [form, setForm] = useState(
    Object.fromEntries(
      fieldNames.map((fieldName, index) => [fieldName, index === 7 ? '' : index.toString()]),
    ),
  );

  return (
    <>
      <Space>
        <Button
          onClick={() => {
            formRef.current && formRef.current.validate();
          }}
        >
          {'提交'}
        </Button>
        <Button
          onClick={() => {
            formRef.current && formRef.current.resetFields();
          }}
        >
          {'重置'}
        </Button>
        <Button
          onClick={() => {
            formRef.current && formRef.current.scrollToField('name19');
          }}
        >
          {'滚动到最后一个字段'}
        </Button>
      </Space>
      <Form
        ref={formRef}
        className={'sd:mt-5 sd:h-75 sd:w-125 sd:overflow-auto sd:pr-4'}
        model={form}
        scrollToFirstError={true}
      >
        {fieldNames.map((fieldName, index) => (
          <>
            <FormItem
              field={fieldName}
              label={'user' + index}
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input
                value={form[fieldName]}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft[fieldName] = next as (typeof form)[number];
                    return draft;
                  })
                }
              />
            </FormItem>
          </>
        ))}
      </Form>
    </>
  );
}
