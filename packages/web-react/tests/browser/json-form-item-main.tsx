import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Form, type FormInstance } from '../../src/form/index.js';
import { Input } from '../../src/input/index.js';
import { JsonFormItem, type JsonFormItemSchema } from '../../src/json-form/item.js';
import '../../styles/form.scss';
import '../../styles/input.scss';
import '../../styles/grid.scss';

function Rendered() {
  return <span data-testid="rendered">Rendered component</span>;
}
function Fixture() {
  const mode = new URLSearchParams(location.search).get('mode');
  const [model, setModel] = useState<Record<string, unknown>>({ name: '', other: 'Other' });
  const [alternate, setAlternate] = useState(false);
  const [errors, setErrors] = useState('');
  const form = useRef<FormInstance>(null);
  let schema: JsonFormItemSchema = {
    field: alternate ? 'other' : 'name',
    label: 'Name',
    required: true,
  };
  if (mode === 'hidden') schema.hidden = !alternate;
  if (mode === 'bare') schema.type = 'noFormItem';
  if (mode === 'slots') schema.slotName = alternate ? undefined : 'custom';
  if (mode === 'render') schema.render = alternate ? undefined : Rendered;
  if (mode === 'row')
    schema = {
      field: 'row',
      type: 'row',
      children: [
        { field: 'name', label: 'Name', span: 12, required: true },
        {
          field: 'other',
          label: 'Other',
          span: 12,
          colProps: { span: 8 },
          formItemProps: { hideLabel: true },
        },
      ],
    };
  if (mode === 'pointer') {
    schema.field = '/a~1b';
    schema.formItemRules = { required: true, message: 'Pointer required' };
  }
  return (
    <>
      <button onClick={() => setAlternate(!alternate)}>Toggle</button>
      <button onClick={() => setModel({ name: '', other: 'Replacement' })}>Replace</button>
      <button
        onClick={async () => setErrors(JSON.stringify((await form.current!.validate()) ?? {}))}
      >
        Validate
      </button>
      <Form ref={form} model={model}>
        <JsonFormItem
          schema={schema}
          model={model}
          adapter={mode === 'pointer' ? 'a2ui-0.9.1' : 'default'}
          components={{ input: Input }}
          prefixCls="sd-json-form"
          onValueChange={(next) => setModel({ ...next })}
          slots={{
            hidden: ({ record, value }) => (
              <span data-testid="hidden">
                {record.field}:{String(value)}
              </span>
            ),
            default: ({ record }) =>
              mode === 'bare' ? <span data-testid="bare">{record.field}</span> : null,
            custom: ({ record, value }) => (
              <span data-testid="custom">
                {record.field}:{String(value)}
              </span>
            ),
            extra: ({ record }) => <span data-testid="extra">Extra {record.field}</span>,
          }}
        />
      </Form>
      <output data-testid="model">{JSON.stringify(model)}</output>
      <output data-testid="errors">{errors}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
