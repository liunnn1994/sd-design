/** @jsxImportSource react */
import { KvList } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [json, setJson] = useState([
    { key: 'region', value: 'cn-north' },
    { key: 'environment', value: 'production' },
  ]);
  const [bulk, setBulk] = useState<NonNullable<ComponentProps<typeof KvList>['bulk']>>('');

  return (
    <>
      <div data-v-40c9bae7="" className={'demo'}>
        <KvList
          data-v-40c9bae7=""
          json={json}
          onJsonChange={(next) => setJson(next as typeof json)}
          bulk={bulk}
          onBulkChange={(next) => setBulk(next as typeof bulk)}
        />
        <pre data-v-40c9bae7="">{formatValue(json)}</pre>
      </div>
      <style>
        {
          '\n.demo[data-v-40c9bae7] {\n    display: grid;\n    gap: 16px;\n}\npre[data-v-40c9bae7] {\n    margin: 0;\n    padding: 12px;\n    overflow: auto;\n    background: var(--sd-color-fill-1);\n    border-radius: 4px;\n}\n'
        }
      </style>
    </>
  );
}
