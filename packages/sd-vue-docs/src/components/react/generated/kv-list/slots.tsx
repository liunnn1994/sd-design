/** @jsxImportSource react */
import { Input, KvList, Select } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

export default function Example() {
  const [json, setJson] = useState([{ key: 'timeout', value: '30' }]);
  const [bulk, setBulk] = useState<NonNullable<ComponentProps<typeof KvList>['bulk']>>('');
  const keyOptions = ['timeout', 'retries', 'region'];

  return (
    <>
      <KvList
        json={json}
        onJsonChange={(next) => setJson(next as typeof json)}
        bulk={bulk}
        onBulkChange={(next) => setBulk(next as typeof bulk)}
        renderKey={({ value, update, props }) => (
          <>
            <Select
              {...props}
              value={value}
              options={keyOptions}
              placeholder={'选择配置项'}
              onChange={(value: unknown) => update(String(value))}
            />
          </>
        )}
        renderValue={({ value, update, props }) => (
          <>
            <Input {...props} value={value} allowClear={true} onInput={update} />
          </>
        )}
      />
    </>
  );
}
