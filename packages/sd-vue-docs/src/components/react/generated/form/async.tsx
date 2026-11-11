/** @jsxImportSource react */
import type { FieldRule, FormInstance } from '@sdata/web-react';

import { Button, Checkbox, Form, FormItem, Input } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const formRef = useRef<ComponentRef<typeof Form> | null>(null);
  const [form, setForm] = useState({
    name: '',
    post: '',
    isRead: false,
  });
  const rules: FieldRule[] = [
    {
      validator: (value: unknown, cb: (error?: string) => void) => {
        return new Promise<void>((resolve) => {
          window.setTimeout(() => {
            if (value !== 'admin') {
              cb('用户名必须为 admin');
            }
            resolve();
          }, 2000);
        });
      },
    },
  ];
  const handleClick = () => {
    formRef.current?.setFields({
      name: {
        status: 'error',
        message: '姓名异步校验失败',
      },
      post: {
        status: 'error',
        message: '有效岗位',
      },
    });
  };

  return (
    <>
      <Form ref={formRef} model={form} className={'sd:w-150'}>
        <FormItem field={'name'} label={'用户名'} rules={rules}>
          <Input
            value={form.name}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.name = next as (typeof form)['name'];
                return draft;
              })
            }
            placeholder={'请输入用户名…'}
          />
        </FormItem>
        <FormItem field={'post'} label={'岗位'}>
          <Input
            value={form.post}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.post = next as (typeof form)['post'];
                return draft;
              })
            }
            placeholder={'请输入岗位…'}
          />
        </FormItem>
        <FormItem field={'isRead'}>
          <Checkbox
            modelValue={form.isRead}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.isRead = next as (typeof form)['isRead'];
                return draft;
              })
            }
          >
            {' 我已阅读使用手册 '}
          </Checkbox>
        </FormItem>
        <FormItem>
          <Button onClick={handleClick}>{'设置状态'}</Button>
        </FormItem>
      </Form>
      {formatValue(form)}
    </>
  );
}
