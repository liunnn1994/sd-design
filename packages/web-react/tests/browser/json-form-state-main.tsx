import type {
  JsonFormAdapter,
  JsonFormModel,
  TranslatedJsonFormSchema,
} from '@sdata/web-core/json-form/types';

import { translateA2UI_0_9_1ToJsonFormSchemas } from '@sdata/web-core/json-form/schema';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useJsonForm, useJsonFormField } from '../../src/json-form/use-json-form.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const a2ui = query.has('a2ui');
  const original = useRef<JsonFormModel>({
    'name': 'first',
    'nested': { second: 'two' },
    'a/b': 'slash',
    'title': 'Title',
  });
  const [model, setModel] = useState(original.current);
  const [path, setPath] = useState(
    query.has('unsafe') ? '__proto__.__jsonFormAuditValue__' : a2ui ? '/name' : 'name',
  );
  const [events, setEvents] = useState<string[]>([]);
  const [globalAdapter, setGlobalAdapter] = useState<JsonFormAdapter>(
    a2ui ? 'a2ui-0.9.1' : 'default',
  );
  const state = useJsonForm<TranslatedJsonFormSchema>(
    {
      value: query.has('controlled') ? model : undefined,
      model,
      adapter: query.has('local') ? 'default' : undefined,
      schemas: a2ui
        ? [{ id: 'root', component: 'TextField', label: { path: '/title' }, value: { path } }]
        : [{ field: path, type: 'input' }],
      onValueChange: (next) => {
        setEvents((values) => [...values, `${next !== model}:${JSON.stringify(next)}`]);
        setModel(next);
      },
    },
    translateA2UI_0_9_1ToJsonFormSchemas,
    globalAdapter,
  );
  const field = useJsonFormField({
    model: state.model,
    field: state.schemas[0]?.field ?? 'name',
    adapter: state.adapter,
    onValueChange: state.publish,
  });
  return (
    <>
      <button
        onClick={() =>
          setModel({
            'name': 'replacement',
            'nested': { second: 'new' },
            'a/b': 'new slash',
            'title': 'New title',
          })
        }
      >
        Replace model
      </button>
      <button onClick={() => setPath(a2ui ? '/a~1b' : 'nested.second')}>Change field</button>
      <button
        onClick={() => setGlobalAdapter(globalAdapter === 'default' ? 'a2ui-0.9.1' : 'default')}
      >
        Global adapter
      </button>
      <input
        aria-label="Field"
        value={String(field.value ?? '')}
        onChange={(event) => field.foundation.setValue(event.target.value)}
      />
      <output data-testid="model">{JSON.stringify(state.model)}</output>
      <output data-testid="original">{JSON.stringify(original.current)}</output>
      <output data-testid="schemas">{JSON.stringify(state.schemas)}</output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="adapter">{state.adapter}</output>
      <output data-testid="field">{field.field}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
