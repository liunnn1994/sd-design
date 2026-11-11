/** @jsxImportSource react */
import { defineJsonFormSchemas } from '@sdata/web-react';
import { Alert, Toolbar } from '@sdata/web-react';
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
    status: '',
  });
  const createSchemas = defineJsonFormSchemas();
  const schemas = createSchemas([
    {
      field: 'name',
      label: '名称',
      type: 'input',
      componentProps: { placeholder: '请输入名称', allowClear: true },
    },
    {
      field: 'status',
      label: '状态',
      type: 'select',
      componentProps: {
        placeholder: '请选择状态',
        allowClear: true,
        options: [
          { label: '运行中', value: 'running' },
          { label: '已停止', value: 'stopped' },
        ],
      },
    },
  ]);
  function onSearch(params: Record<string, unknown>) {
    console.log('search', params);
  }

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <Toolbar
          value={formState}
          onValueChange={(next) => setFormState(next as typeof formState)}
          schemas={schemas}
          onSearch={onSearch}
        />
        <Alert type={'info'}>
          {' 当前查询条件：'}
          {formatValue(JSON.stringify(formState))}
        </Alert>
      </div>
    </>
  );
}
