/** @jsxImportSource react */
import type { FieldRule, FormInstance, ValidatedError } from '@sdata/web-react';

import { Button, Form, FormItem, Input, InputPassword, Space } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const handleSubmit = ({
    values,
    errors,
  }: {
    values: Record<string, unknown>;
    errors?: Record<string, ValidatedError>;
  }) => {
    console.log('values:', values, '\nerrors:', errors);
  };
  const [form, setForm] = useState({
    name: '',
    password: '',
    password2: '',
    email: '',
    ip: '192.168.2.1',
    url: '',
    match: '',
  });
  const rules: Record<string, FieldRule[]> = {
    name: [
      {
        required: true,
        message: '请输入姓名',
      },
    ],
    password: [
      {
        required: true,
        message: '请输入密码',
      },
    ],
    password2: [
      {
        required: true,
        message: '请输入密码',
      },
      {
        validator: (value: unknown, cb: (error?: string) => void) => {
          if (value !== form.password) {
            cb('两次输入的密码不一致');
          } else {
            cb();
          }
        },
      },
    ],
    email: [
      {
        type: 'email',
        required: true,
      },
    ],
    ip: [
      {
        type: 'ip',
        required: true,
      },
    ],
    url: [
      {
        type: 'url',
        required: true,
      },
    ],
    match: [
      {
        required: true,
        validator: (value: unknown, cb: (error?: string) => void) => {
          return new Promise<void>((resolve) => {
            if (!value) {
              cb('请输入匹配内容');
            }
            if (value !== 'match') {
              cb('内容必须为 match');
            }
            resolve();
          });
        },
      },
    ],
  };
  const formRef = useRef<ComponentRef<typeof Form> | null>(null);

  return (
    <>
      <Form ref={formRef} rules={rules} model={form} className={'sd:w-150'} onSubmit={handleSubmit}>
        <FormItem field={'name'} label={'用户名'} validateTrigger={'blur'}>
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
        <FormItem field={'password'} label={'密码'} validateTrigger={'blur'}>
          <InputPassword
            value={form.password}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.password = next as (typeof form)['password'];
                return draft;
              })
            }
            placeholder={'请输入密码…'}
          />
        </FormItem>
        <FormItem field={'password2'} label={'确认密码'} validateTrigger={'blur'}>
          <InputPassword
            value={form.password2}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.password2 = next as (typeof form)['password2'];
                return draft;
              })
            }
            placeholder={'请再次输入密码…'}
          />
        </FormItem>
        <FormItem field={'email'} label={'电子邮箱'}>
          <Input
            value={form.email}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.email = next as (typeof form)['email'];
                return draft;
              })
            }
            placeholder={'请输入邮箱…'}
          />
        </FormItem>
        <FormItem field={'ip'} label={'IP'}>
          <Input
            value={form.ip}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.ip = next as (typeof form)['ip'];
                return draft;
              })
            }
            placeholder={'请输入 IP 地址…'}
          />
        </FormItem>
        <FormItem field={'url'} label={'URL'}>
          <Input
            value={form.url}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.url = next as (typeof form)['url'];
                return draft;
              })
            }
            placeholder={'请输入网址…'}
          />
        </FormItem>
        <FormItem field={'match'} label={'匹配'}>
          <Input
            value={form.match}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.match = next as (typeof form)['match'];
                return draft;
              })
            }
            placeholder={'请输入匹配内容…'}
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button htmlType={'submit'}>{'提交'}</Button>
            <Button
              onClick={() => {
                formRef.current?.resetFields();
              }}
            >
              {'重置'}
            </Button>
          </Space>
        </FormItem>
      </Form>
      {formatValue(form)}
    </>
  );
}
