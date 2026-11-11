/** @jsxImportSource react */
import { KvList } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

export default function Example() {
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [headerBulk, setHeaderBulk] =
    useState<NonNullable<ComponentProps<typeof KvList>['bulk']>>('');
  const [secrets, setSecrets] = useState([{ key: 'API_TOKEN', value: 'secret-value' }]);
  const [secretBulk, setSecretBulk] =
    useState<NonNullable<ComponentProps<typeof KvList>['bulk']>>('');

  return (
    <>
      <div data-v-91d86580="" className={'demo'}>
        <h4 data-v-91d86580="">{'HTTP 请求头'}</h4>
        <KvList
          data-v-91d86580=""
          json={headers}
          onJsonChange={(next) => setHeaders(next as typeof headers)}
          bulk={headerBulk}
          onBulkChange={(next) => setHeaderBulk(next as typeof headerBulk)}
          type={'http-header'}
        />
        <h4 data-v-91d86580="">{'密钥'}</h4>
        <KvList
          data-v-91d86580=""
          json={secrets}
          onJsonChange={(next) => setSecrets(next as typeof secrets)}
          bulk={secretBulk}
          onBulkChange={(next) => setSecretBulk(next as typeof secretBulk)}
          type={'secret'}
        />
      </div>
      <style>
        {
          '\n.demo[data-v-91d86580] {\n    display: grid;\n    gap: 12px;\n}\nh4[data-v-91d86580] {\n    margin: 0;\n}\n'
        }
      </style>
    </>
  );
}
