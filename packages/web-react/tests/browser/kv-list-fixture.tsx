import { useEffect, useRef, useState } from 'react';

import type { KvListItem, KvListProps } from '../../src/kv-list/types.js';

import { Input } from '../../src/input/index.js';
import { KvList } from '../../src/kv-list/index.js';
export function KvListFixture() {
  const [json, setJson] = useState<KvListItem[]>([
    { key: 'first', value: '1' },
    { key: 'second', value: '2' },
  ]);
  const [bulk, setBulk] = useState('');
  const [options, setOptions] = useState<Partial<KvListProps>>({});
  const [custom, setCustom] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [accept, setAccept] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const [rootName, setRootName] = useState('');
  useEffect(() => {
    const disable = () => setOptions((old) => ({ ...old, disabled: true }));
    const unmount = () => setMounted(false);
    window.addEventListener('kv-disable', disable);
    window.addEventListener('kv-unmount', unmount);
    return () => {
      window.removeEventListener('kv-disable', disable);
      window.removeEventListener('kv-unmount', unmount);
    };
  }, []);
  return (
    <section style={{ padding: 24, width: 650, maxWidth: '100%' }}>
      {mounted && (
        <KvList
          {...options}
          ref={root}
          data-testid="kv-main"
          json={json}
          bulk={bulk}
          onJsonChange={(value) => {
            setEvents((old) => [...old, `json:${JSON.stringify(value)}`]);
            if (accept) setJson(value);
          }}
          onBulkChange={(value) => {
            setEvents((old) => [...old, `bulk:${value}`]);
            if (accept) setBulk(value);
          }}
          toolbarExtra={<span data-testid="kv-toolbar-extra">Toolbar</span>}
          renderRowActions={({ item, index }) => (
            <span data-testid="kv-action">
              {index}:{item.key}
            </span>
          )}
          renderKey={
            custom
              ? ({ props, value, update }) => (
                  <Input
                    {...props}
                    value={value}
                    onValueChange={update}
                    data-testid="kv-custom-key"
                  />
                )
              : undefined
          }
          renderValue={
            custom
              ? ({ props, value, update }) => (
                  <Input
                    {...props}
                    value={value}
                    onValueChange={update}
                    data-testid="kv-custom-value"
                  />
                )
              : undefined
          }
        />
      )}
      <output data-testid="kv-json">{JSON.stringify(json)}</output>
      <pre data-testid="kv-bulk">{bulk}</pre>
      <output data-testid="kv-events">{events.join('|')}</output>
      <output data-testid="kv-ref">{rootName}</output>
      <div>
        <button
          onClick={() =>
            setOptions((old) => ({ ...old, type: old.type === 'secret' ? undefined : 'secret' }))
          }
        >
          KV secret
        </button>
        <button onClick={() => setOptions((old) => ({ ...old, type: 'http-header' }))}>
          KV headers
        </button>
        <button onClick={() => setOptions((old) => ({ ...old, disabled: !old.disabled }))}>
          KV disabled
        </button>
        <button
          onClick={() =>
            setOptions((old) => ({
              ...old,
              bulkEditable: old.bulkEditable === true ? false : true,
            }))
          }
        >
          KV bulk permission
        </button>
        <button
          onClick={() =>
            setOptions((old) => ({
              ...old,
              keyProps: { placeholder: 'Custom key', data: ['X-Custom'], allowClear: true },
              valueProps: { placeholder: 'Custom value', disabled: true },
            }))
          }
        >
          KV field props
        </button>
        <button onClick={() => setJson([{ key: 'external', value: ' changed ' }])}>
          KV replace JSON
        </button>
        <button
          onClick={() => {
            json[0].value = ' nested ';
            setOptions((old) => ({ ...old }));
          }}
        >
          KV nested JSON
        </button>
        <button onClick={() => setBulk('next: new: value\nnext: duplicate\n: ignored')}>
          KV replace bulk
        </button>
        <button onClick={() => setCustom((value) => !value)}>KV custom</button>
        <button onClick={() => setMounted((value) => !value)}>KV mount</button>
        <button onClick={() => setAccept((value) => !value)}>KV accept</button>
        <button onClick={() => setRootName(root.current?.tagName ?? 'none')}>KV ref</button>
        <button onClick={() => setEvents([])}>KV clear events</button>
      </div>
      <KvList data-testid="kv-uncontrolled" defaultBulk="default: local" />
    </section>
  );
}
