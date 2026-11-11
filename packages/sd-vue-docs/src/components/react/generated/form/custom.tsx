import type { ComponentProps } from 'react';

/** @jsxImportSource react */
import { Form, FormItem, useFormItem } from '@sdata/web-react';
import { Space, Switch } from '@sdata/web-react';
import { createElement, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

function MyInput({
  value,
  onValueChange,
  ...attrs
}: Omit<ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string;
  onValueChange(value: string): void;
}) {
  const { mergedDisabled, eventHandlers } = useFormItem();
  return (
    <input
      {...attrs}
      value={value}
      disabled={mergedDisabled}
      onChange={(event) => {
        onValueChange(event.currentTarget.value);
        eventHandlers?.onChange?.(event.nativeEvent);
      }}
      onBlur={(event) => {
        attrs.onBlur?.(event);
        eventHandlers?.onBlur?.(event.nativeEvent);
      }}
    />
  );
}

export default function Example() {
  const [disabled, setDisabled] = useState(false);
  const [form, setForm] = useState({
    name: '',
  });

  return (
    <>
      <Space className={'sd:mb-5'}>
        <Switch value={disabled} onChange={(next) => setDisabled(next as typeof disabled)} />
        {' 禁用： '}
        {formatValue(disabled)}
      </Space>
      <Form model={form} disabled={disabled} className={'sd:w-150'}>
        <FormItem
          field={'name'}
          label={'用户名'}
          rules={[
            { required: true, message: '请输入姓名' },
            { minLength: 5, message: '长度必须大于 5 个字符' },
          ]}
        >
          <MyInput
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
      </Form>
    </>
  );
}
