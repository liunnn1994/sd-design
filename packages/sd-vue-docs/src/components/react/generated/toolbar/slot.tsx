/** @jsxImportSource react */
import { Alert, Input, Select, Space, Toolbar } from '@sdata/web-react';
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
  function onSearch(params: Record<string, unknown>) {
    console.log('search', params);
  }

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <Toolbar
          value={formState}
          onValueChange={(next) => setFormState(next as typeof formState)}
          onSearch={onSearch}
        >
          <Space>
            <Input
              value={formState.name}
              onValueChange={(next) =>
                setFormState((previous) => {
                  const draft = structuredClone(previous);
                  draft.name = next as (typeof formState)['name'];
                  return draft;
                })
              }
              placeholder={'请输入名称'}
              allowClear={true}
              style={{ width: '200px' }}
            />
            <Select
              value={formState.status}
              onValueChange={(next) =>
                setFormState((previous) => {
                  const draft = structuredClone(previous);
                  draft.status = next as (typeof formState)['status'];
                  return draft;
                })
              }
              placeholder={'请选择状态'}
              allowClear={true}
              style={{ width: '160px' }}
              options={[
                { label: '运行中', value: 'running' },
                { label: '已停止', value: 'stopped' },
              ]}
            />
          </Space>
        </Toolbar>
        <Alert type={'info'}>
          {' 当前查询条件：'}
          {formatValue(JSON.stringify(formState))}
        </Alert>
      </div>
    </>
  );
}
