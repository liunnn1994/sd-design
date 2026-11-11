/** @jsxImportSource react */
import {
  Textarea,
  defineJsonFormComponents,
  defineJsonFormSchemas,
  type JsonFormProviderConfig,
} from '@sdata/web-react';
import { Alert, ConfigProvider, JsonForm } from '@sdata/web-react';
import { createElement, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

function DemoScriptField({
  value = '',
  placeholder = '请输入业务脚本内容',
  disabled = false,
  onValueChange,
}: {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?(value: string): void;
}) {
  return (
    <div className="demo-script-field">
      <div className="demo-script-field__hint">这里用 sd-textarea 模拟业务里的自定义字段组件。</div>
      <Textarea
        autoSize={{ minRows: 6, maxRows: 10 }}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    </div>
  );
}

export default function Example() {
  const [formState, setFormState] = useState({
    mode: 'script',
    enableAdvanced: false,
    script: 'const start = true;',
    webhook: '',
    approver: '',
    remark: '',
  });
  const customComponents = defineJsonFormComponents({
    scriptField: DemoScriptField,
  });
  const createSchemas = defineJsonFormSchemas<typeof customComponents>();
  const schemas = (() => {
    const isAdvanced = formState.enableAdvanced;
    const mode = formState.mode;

    return createSchemas([
      {
        field: 'mode',
        label: '触发模式',
        type: 'select',
        componentProps: {
          options: [
            { label: '脚本模式', value: 'script' },
            { label: 'Webhook 模式', value: 'webhook' },
            { label: '审批模式', value: 'approval' },
          ],
        },
      },
      {
        field: 'enableAdvanced',
        label: '启用高级配置',
        type: 'checkbox',
      },
      {
        field: 'script',
        label: '脚本',
        type: 'scriptField',
        hidden: mode !== 'script',
        componentProps: {
          disabled: !isAdvanced,
          placeholder: isAdvanced ? '例如：const start = true;' : '勾选“启用高级配置”后可编辑脚本',
        },
      },
      {
        field: 'webhook',
        label: 'Webhook 地址',
        type: 'input',
        hidden: mode !== 'webhook',
        componentProps: {
          disabled: !isAdvanced,
          placeholder: '例如：https://api.example.com/hooks/order',
        },
      },
      {
        field: 'approver',
        label: '审批人',
        type: 'input',
        hidden: mode !== 'approval',
        componentProps: {
          disabled: !isAdvanced,
          placeholder: '例如：张三',
        },
      },
      {
        field: 'remark',
        label: '高级备注',
        type: 'textarea',
        componentProps: {
          disabled: !isAdvanced,
          placeholder: isAdvanced ? '填写规则补充说明' : '未启用高级配置时不可编辑',
        },
      },
    ]);
  })();
  const jsonForm: JsonFormProviderConfig<typeof customComponents> = {
    components: customComponents,
  };

  return (
    <>
      <ConfigProvider data-v-746378d5="" jsonForm={jsonForm}>
        <JsonForm
          data-v-746378d5=""
          model={formState}
          onModelChange={(next) => setFormState(next as typeof formState)}
          schemas={schemas}
        />
      </ConfigProvider>
      <Alert data-v-746378d5="" type={'success'}>
        {' 当前数据：'}
        {formatValue(JSON.stringify(formState))}
      </Alert>
      <style>
        {
          '\n.demo-script-field[data-v-746378d5] {\n    display: grid;\n    gap: 8px;\n}\n.demo-script-field__hint[data-v-746378d5] {\n    padding: 8px 12px;\n    color: var(--color-text-2);\n    font-size: 12px;\n    background: var(--color-fill-2);\n    border: 1px dashed var(--color-border-2);\n    border-radius: 10px;\n}\n[data-v-746378d5] .sd-alert {\n    margin-top: 16px;\n}\n'
        }
      </style>
    </>
  );
}
