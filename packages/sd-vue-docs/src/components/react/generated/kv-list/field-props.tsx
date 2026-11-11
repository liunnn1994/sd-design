/** @jsxImportSource react */
import { KvList } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

export default function Example() {
  const [json, setJson] = useState([{ key: '', value: '' }]);
  const [bulk, setBulk] = useState<NonNullable<ComponentProps<typeof KvList>['bulk']>>('');

  return (
    <>
      <KvList
        json={json}
        onJsonChange={(next) => setJson(next as typeof json)}
        bulk={bulk}
        onBulkChange={(next) => setBulk(next as typeof bulk)}
        keyProps={{ placeholder: '配置项', allowClear: true }}
        valueProps={{ placeholder: '配置值', maxLength: 32 }}
      />
    </>
  );
}
