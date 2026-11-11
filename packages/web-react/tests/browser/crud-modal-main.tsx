import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TableData } from '../../src/table/index.js';

import { BasicCrudModal, type CrudModalInstance } from '../../src/basic-crud-table/modal.js';
import '../../styles/json-form.scss';
import '../../styles/modal.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const api = useRef<CrudModalInstance<TableData>>(null);
  const hook = useRef<((value: boolean) => void) | null>(null);
  const detail = useRef(new Map<string, (row: TableData) => void>());
  const [events, setEvents] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [mounted, setMounted] = useState(true);
  const record = (event: string) => setEvents((old) => [...old, event]);
  return (
    <>
      <button onClick={async () => setStatus(String(await api.current?.open()))}>Create</button>
      <button
        onClick={async () =>
          setStatus(String(await api.current?.open({ key: 1, name: 'Original' })))
        }
      >
        Edit one
      </button>
      <button
        onClick={async () => setStatus(String(await api.current?.open({ key: 2, name: 'Second' })))}
      >
        Edit two
      </button>
      <button
        onClick={() => {
          detail.current.get('1')?.({ key: 1, name: 'Late first' });
        }}
      >
        Resolve first
      </button>
      <button
        onClick={() => {
          detail.current.get('2')?.({ key: 2, name: 'Current second' });
        }}
      >
        Resolve second
      </button>
      <button onClick={() => hook.current?.(true)}>Resolve hook</button>
      <button onClick={() => setMounted(false)}>Unmount</button>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="status">{status}</output>
      {mounted && (
        <BasicCrudModal
          ref={api}
          defaultModel={{ name: 'Initial' }}
          modalFormProps={{
            schemas: [{ field: 'name', label: 'Name', type: 'input', required: true }],
          }}
          modalProps={{ modalAnimationName: '', maskAnimationName: '' }}
          detailApi={
            query.has('deferred')
              ? (row) =>
                  new Promise((resolve) =>
                    detail.current.set(String(row.key), (next) => resolve({ ...next })),
                  )
              : query.has('failure')
                ? async () => {
                    throw new Error('detail failed');
                  }
                : undefined
          }
          beforeSubmit={
            query.has('hook')
              ? () =>
                  new Promise<boolean>((resolve) => {
                    hook.current = resolve;
                    record('hook');
                  })
              : query.has('blocked')
                ? () => false
                : undefined
          }
          createApi={async (model) => {
            record(`create:${String(model.name)}`);
            if (query.has('api-failure')) throw new Error('create failed');
            return 'created';
          }}
          updateApi={async (model) => {
            record(`update:${String(model.name)}`);
            return 'updated';
          }}
          valueTransformer={
            query.has('transform')
              ? (model) => ({ ...model, name: `${String(model.name)} transformed` })
              : undefined
          }
          onSuccess={(result, context) =>
            record(`success:${String(result)}:${context.type}:${String(context.model.name)}`)
          }
          onError={(error) => record(`error:${(error as Error).message}`)}
          onClose={() => record('close')}
          slots={
            query.has('slots')
              ? {
                  title: ({ type }) => <b data-testid="title">Mode:{String(type)}</b>,
                  extra: ({ type, model }) => (
                    <b data-testid="field-scope">
                      {String(type)}:{String((model as Record<string, unknown>).name)}
                    </b>
                  ),
                }
              : undefined
          }
        />
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
