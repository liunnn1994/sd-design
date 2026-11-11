/** @jsxImportSource react */
import { A2UI_0_9_1, type JsonFormA2UI_0_9_1ComponentNode } from '@sdata/web-react';
import { JsonForm, Space, Tag } from '@sdata/web-react';
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
    contact: {
      name: '',
      subscribed: false,
      channels: [] as string[],
    },
  });
  const components: JsonFormA2UI_0_9_1ComponentNode[] = [
    {
      id: 'name-field',
      component: 'TextField',
      label: '姓名',
      value: { path: '/contact/name' },
      variant: 'shortText',
    },
    {
      id: 'root',
      component: 'Card',
      child: 'form-column',
    },
    {
      id: 'form-column',
      component: 'Column',
      children: ['name-field', 'subscribed-field', 'channel-field'],
    },
    {
      id: 'subscribed-field',
      component: 'CheckBox',
      label: '订阅通知',
      value: { path: '/contact/subscribed' },
    },
    {
      id: 'channel-field',
      component: 'ChoicePicker',
      label: '首选渠道',
      variant: 'mutuallyExclusive',
      options: [
        { label: '短信', value: 'sms' },
        { label: '邮件', value: 'email' },
      ],
      value: { path: '/contact/channels' },
    },
  ];

  return (
    <>
      <JsonForm
        data-v-b602184c=""
        model={formState}
        onModelChange={(next) => setFormState(next as typeof formState)}
        adapter={A2UI_0_9_1}
        schemas={components}
      />
      <Space data-v-b602184c="" wrap={true}>
        <Tag data-v-b602184c="" color={'blue'}>
          {formatValue(formState.contact.name || '未填写姓名')}
        </Tag>
        <Tag data-v-b602184c="" color={'green'}>
          {formatValue(formState.contact.channels.join('、') || '未选择渠道')}
        </Tag>
      </Space>
      <style>{'\n[data-v-b602184c] .sd-space {\n    margin-top: 16px;\n}\n'}</style>
    </>
  );
}
