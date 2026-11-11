import { getJsonFormValue } from '@sdata/web-core/json-form/schema';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Form, type FormProps } from '../../src/form/index.js';
import { JsonForm } from '../../src/json-form/json-form.js';
import {
  A2UI_0_9_1,
  defineJsonFormComponents,
  defineJsonFormSchemas,
  type JsonFormA2UI_0_9_1ComponentNode,
  type JsonFormInstance,
  type JsonFormModel,
  type JsonFormSchema,
} from '../../src/json-form/types.js';
import '../../styles/json-form.scss';

function Counter({
  value = 0,
  step = 1,
  onValueChange,
}: {
  value?: number;
  step?: number;
  onValueChange?(value: number): void;
}) {
  return (
    <button type="button" data-testid="counter" onClick={() => onValueChange?.(value + step)}>
      Count:{value}
    </button>
  );
}
const components = defineJsonFormComponents({ counter: Counter });
const customSchemas = defineJsonFormSchemas<typeof components>()([
  { field: 'count', type: 'counter', componentProps: { step: 2 } },
]);
function CustomForm({ className, ...props }: FormProps) {
  return <Form {...props} className={`custom-form ${className ?? ''}`} />;
}
const a2uiSchemas: JsonFormA2UI_0_9_1ComponentNode[] = [
  { id: 'root', component: 'Column', children: ['name', 'choice'] },
  { id: 'name', component: 'TextField', label: { path: '/title' }, value: { path: '/a~1b' } },
  {
    id: 'choice',
    component: 'ChoicePicker',
    label: 'Choices',
    value: { path: '/choices' },
    displayStyle: 'chips',
    variant: 'multipleSelection',
    options: [
      { label: 'One', value: 'one' },
      { label: 'Two', value: 'two' },
    ],
  },
];
function Fixture() {
  const query = new URLSearchParams(location.search);
  const source = useRef<JsonFormModel>({
    'user': { name: '' },
    'enabled': false,
    'agree': false,
    'amount': 1,
    'city': 'Paris',
    'count': 0,
    'title': 'Pointer',
    'a/b': 'first',
    'choices': [],
  });
  const originalUser = useRef(source.current.user);
  const [controlled, setControlled] = useState(source.current);
  const [events, setEvents] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState('');
  const [status, setStatus] = useState('');
  const [hidden, setHidden] = useState(false);
  const [, rerender] = useState(0);
  const api = useRef<JsonFormInstance>(null);
  const record = (event: string) => setEvents((old) => [...old, event]);
  const schemas: JsonFormSchema<string>[] = [
    {
      field: 'user.name',
      label: 'Name',
      type: 'input',
      required: true,
      hidden,
      componentProps: { onValueChange: (next: string) => record(`props:${next}`) },
      componentEvents: { 'update:modelValue': (next: string) => record(`event:${next}`) },
      componentSlots: query.has('slots') ? { prefix: <b data-testid="prefix">User</b> } : undefined,
    },
    { field: 'enabled', label: 'Enabled', type: 'switch' },
    { field: 'agree', label: 'Agreement', type: 'checkbox' },
    {
      field: 'layout',
      type: 'row',
      componentProps: { className: 'custom-layout' },
      children: [
        { field: 'amount', label: 'Amount', type: 'inputNumber', span: 12 },
        { field: 'city', label: 'City', type: 'input', span: 12 },
      ],
    },
    ...customSchemas,
    ...(query.has('unknown') ? [{ field: 'fallback', type: 'constructor' }] : []),
    ...(query.has('slots')
      ? [
          {
            field: 'rating',
            type: 'rate',
            componentSlots: {
              character: ({ index }: { index: number }) => (
                <b data-testid="character">Star {index}</b>
              ),
            },
          },
          {
            field: 'destination',
            type: 'select',
            componentProps: {
              options: [
                { label: 'Paris', value: 'paris' },
                { label: 'Rome', value: 'rome' },
              ],
            },
            componentSlots: {
              option: ({ data }: { data: { label: string } }) => (
                <b data-testid="option">City {data.label}</b>
              ),
              renderLabel: (data: { label: string }) => (
                <b data-testid="selected-label">Selected {data.label}</b>
              ),
            },
          },
        ]
      : []),
  ];
  const isControlled = query.has('controlled') || query.has('alias');
  return (
    <ConfigProvider
      jsonForm={{
        components,
        adapter: query.has('a2ui') || query.has('local') ? A2UI_0_9_1 : undefined,
      }}
    >
      <button
        onClick={() =>
          setSnapshot(
            `${JSON.stringify(isControlled ? controlled : source.current)};sameUser:${source.current.user === originalUser.current}`,
          )
        }
      >
        Read model
      </button>
      <button
        onClick={async () => setStatus((await api.current?.validate()) ? 'invalid' : 'valid')}
      >
        Validate
      </button>
      <button onClick={() => api.current?.setFields({ 'user.name': { value: 'Preset' } })}>
        Preset
      </button>
      <button onClick={() => api.current?.resetFields()}>Reset</button>
      <button onClick={() => api.current?.clearValidate()}>Clear validation</button>
      <button onClick={() => setHidden(!hidden)}>Hide name</button>
      <button
        onClick={() => {
          source.current.title = 'Changed pointer';
          rerender((n) => n + 1);
        }}
      >
        Change label
      </button>
      <output data-testid="model">{snapshot}</output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="status">{status}</output>
      <JsonForm
        ref={api}
        model={source.current}
        value={query.has('controlled') ? controlled : undefined}
        modelValue={query.has('alias') ? controlled : undefined}
        adapter={query.has('local') ? 'default' : undefined}
        schemas={query.has('a2ui') ? a2uiSchemas : schemas}
        onValueChange={(next) => {
          record(
            `root:${String(getJsonFormValue(next, 'user.name', 'default'))}:${next !== controlled}`,
          );
          setControlled(next);
        }}
        component={query.has('custom-form') ? CustomForm : undefined}
        slots={{
          hidden: ({ record: schema }) => <em data-testid="hidden">Hidden:{schema.field}</em>,
        }}
      >
        {query.has('children') ? <p data-testid="manual">Manual form content</p> : undefined}
      </JsonForm>
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
