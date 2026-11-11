/** @jsxImportSource react */
import { defineJsonFormSchemas } from '@sdata/web-react';
import { Alert, JsonForm } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [formState, setFormState] = useState({
    name: '',
    city: 'shanghai',
    bio: '',
    enableAdvanced: false,
    contactType: 'email',
    email: '',
    phone: '',
    wechat: '',
    reminder: '',
  });
  const createSchemas = defineJsonFormSchemas();
  const schemas = (() => {
    const isAdvanced = formState.enableAdvanced;
    const contactType = formState.contactType;

    return createSchemas([
      {
        field: 'name',
        label: '姓名',
        type: 'input',
        required: true,
      },
      {
        field: 'city',
        label: '城市',
        type: 'select',
        componentProps: {
          options: [
            { label: '上海', value: 'shanghai' },
            { label: '杭州', value: 'hangzhou' },
            { label: '深圳', value: 'shenzhen' },
          ],
        },
      },
      {
        field: 'bio',
        label: '简介',
        type: 'textarea',
      },
      {
        field: 'enableAdvanced',
        label: '启用高级配置',
        type: 'checkbox',
      },
      {
        field: 'contactType',
        label: '通知方式',
        type: 'select',
        hidden: !isAdvanced,
        componentProps: {
          options: [
            { label: '邮件', value: 'email' },
            { label: '短信', value: 'sms' },
            { label: '企业微信', value: 'wechat' },
          ],
        },
      },
      {
        field: 'reminder',
        label: '备注',
        type: 'textarea',
        componentProps: {
          disabled: !isAdvanced,
          placeholder: isAdvanced ? '可填写高级配置说明' : '勾选“启用高级配置”后可编辑',
        },
      },
      {
        field: 'email',
        label: '邮箱地址',
        type: 'input',
        required: true,
        hidden: !isAdvanced || contactType !== 'email',
      },
      {
        field: 'phone',
        label: '手机号码',
        type: 'inputMask',
        required: true,
        hidden: !isAdvanced || contactType !== 'sms',
        componentProps: {
          mask: '999 9999 9999',
          maskChar: null,
        },
      },
      {
        field: 'wechat',
        label: '企业微信账号',
        type: 'input',
        required: true,
        hidden: !isAdvanced || contactType !== 'wechat',
      },
    ]);
  })();

  return (
    <>
      <JsonForm
        data-v-992f3aab=""
        model={formState}
        onModelChange={(next) => setFormState(next as typeof formState)}
        schemas={schemas}
      />
      <Alert data-v-992f3aab="" type={'info'}>
        {' 当前数据：'}
        {formatValue(JSON.stringify(formState))}
      </Alert>
      <style>{'\n[data-v-992f3aab] .sd-alert {\n    margin-top: 16px;\n}\n'}</style>
    </>
  );
}
