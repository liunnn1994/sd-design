/** @jsxImportSource react */
import { defineJsonFormSchemas } from '@sdata/web-react';
import { Alert, Button, Input, Toolbar } from '@sdata/web-react';
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
    keyword: '',
  });
  const createSchemas = defineJsonFormSchemas();
  const schemas = createSchemas([
    {
      field: 'keyword',
      label: '关键字',
      slotName: 'keyword',
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
          actionPrepend={
            <>
              <Button>{'导入'}</Button>
            </>
          }
          actionAppend={
            <>
              <Button type={'outline'}>{'导出'}</Button>
            </>
          }
          slots={{
            keyword: () => (
              <>
                <Input
                  value={formState.keyword}
                  onValueChange={(next) =>
                    setFormState((previous) => {
                      const draft = structuredClone(previous);
                      draft.keyword = next as (typeof formState)['keyword'];
                      return draft;
                    })
                  }
                  placeholder={'请输入关键字'}
                  allowClear={true}
                  style={{ width: '220px' }}
                />
              </>
            ),
          }}
        />
        <Alert type={'info'}>
          {' 当前查询条件：'}
          {formatValue(JSON.stringify(formState))}
        </Alert>
      </div>
    </>
  );
}
