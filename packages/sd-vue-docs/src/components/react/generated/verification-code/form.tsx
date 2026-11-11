/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button, Form, FormItem, VerificationCode } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('654321');
  const formRef = useRef<ComponentRef<typeof Form> | null>(null);
  const [form, setForm] = useState({
    code: '',
  });
  const onFinish = (value: string) => Message.info(`验证码：${value}`);

  return (
    <>
      <Form ref={formRef} model={form} className={'sd:w-75'}>
        <FormItem
          field={'code'}
          label={'验证码'}
          rules={[
            { required: true, message: '请输入验证码' },
            { minLength: 6, message: '验证码不完整' },
            { match: /^\d+$/, message: '必须为数字' },
          ]}
        >
          <VerificationCode
            value={form.code}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.code = next as (typeof form)['code'];
                return draft;
              })
            }
            className={'sd:w-75'}
            onFinish={onFinish}
          />
        </FormItem>
        <FormItem>
          <Button type={'primary'} size={'large'} htmlType={'submit'}>
            {'提交'}
          </Button>
        </FormItem>
      </Form>
    </>
  );
}
