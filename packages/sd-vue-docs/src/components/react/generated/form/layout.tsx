/** @jsxImportSource react */
import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Input,
  Radio,
  RadioGroup,
  Space,
} from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'inline'>('horizontal');
  const [form, setForm] = useState({
    name: '',
    post: '',
    isRead: false,
  });

  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-150'}>
        <RadioGroup
          value={layout}
          onValueChange={(next) => setLayout(next as typeof layout)}
          type={'button'}
        >
          <Radio value={'horizontal'}>{'水平'}</Radio>
          <Radio value={'vertical'}>{'垂直'}</Radio>
          <Radio value={'inline'}>{'行内'}</Radio>
        </RadioGroup>
        <Form model={form} layout={layout}>
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
            <Button>{'提交'}</Button>
          </FormItem>
        </Form>
        <div>{formatValue(form)}</div>
      </Space>
    </>
  );
}
