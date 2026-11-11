/** @jsxImportSource react */
import { Button, Form, FormItem, Input } from '@sdata/web-react';
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
    posts: [{ value: '' }],
  });
  const handleAdd = () => {
    setForm((previous) => {
      const next = structuredClone(previous);
      next.posts.push({
        value: '',
      });
      return next;
    });
  };
  const handleDelete = (index: number) => {
    setForm((previous) => {
      const next = structuredClone(previous);
      next.posts.splice(index, 1);
      return next;
    });
  };

  return (
    <>
      <Form model={form} className={'sd:w-150'}>
        <FormItem field={'name'} label={'用户名'}>
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
        {form.posts.map((post, index) => (
          <FormItem field={`posts[${index}].value`} label={`Post-${index}`} key={index}>
            <Input
              value={post.value}
              onValueChange={(next) => (post.value = next as (typeof post)['value'])}
              placeholder={'请输入岗位…'}
            />
            <Button
              onClick={() => {
                handleDelete(index);
              }}
              className={'sd:ml-2.5'}
            >
              {'删除'}
            </Button>
          </FormItem>
        ))}
      </Form>
      <div>
        <Button onClick={handleAdd}>{'添加岗位'}</Button>
      </div>
      {formatValue(form)}
    </>
  );
}
