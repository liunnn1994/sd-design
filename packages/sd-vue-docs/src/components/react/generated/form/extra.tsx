/** @jsxImportSource react */
import { Checkbox, Form, FormItem, Input } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [form, setForm] = useState({
    name: '',
    post: '',
    isRead: false,
  });

  return (
    <>
      <Form model={form} className={'sd:w-150'}>
        <FormItem
          field={'name'}
          label={'用户名'}
          validateTrigger={'input'}
          required={true}
          extra={
            <>
              <div>{'用于登录'}</div>
            </>
          }
        >
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
        <FormItem
          field={'post'}
          label={'岗位'}
          validateTrigger={'input'}
          required={true}
          extra={
            <>
              <div>{'用于登录'}</div>
            </>
          }
          help={
            <>
              <div>{'自定义校验提示'}</div>
            </>
          }
        >
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
      </Form>
      {formatValue(form)}
    </>
  );
}
