import { useRef, useState } from 'react';

import type { FormInstance } from '../../src/index';

import { Button, Form, FormItem, Switch, useFormItem } from '../../src/index';

function FieldInput({ value, onChange }: { value: string; onChange(value: string): void }) {
  const { formItemCtx, eventHandlers, mergedDisabled } = useFormItem();
  return (
    <input
      id={formItemCtx?.fieldId}
      disabled={mergedDisabled}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
        eventHandlers?.onChange?.();
      }}
      onBlur={() => eventHandlers?.onBlur?.()}
    />
  );
}

export function FormFixture() {
  const [model, setModel] = useState({ first: '', second: 'initial', agree: false });
  const [disabled, setDisabled] = useState(false);
  const [dynamic, setDynamic] = useState(false);
  const [nested, setNested] = useState(true);
  const [result, setResult] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [slow, setSlow] = useState(false);
  const pending = useRef<((message?: string) => void)[]>([]);
  const form = useRef<FormInstance>(null);
  const name = dynamic ? 'second' : 'first';
  return (
    <section data-testid="form-fixture">
      <Form
        ref={form}
        id="form:test"
        model={model}
        onModelChange={setModel}
        size="small"
        disabled={disabled}
        autoLabelWidth
        scrollToFirstError={{ behavior: 'instant' }}
        onSubmitSuccess={(values) => {
          setResult(JSON.stringify(values));
          setEvents((old) => [...old, 'success']);
        }}
        onSubmitFailed={({ values }) => {
          setResult(JSON.stringify(values));
          setEvents((old) => [...old, 'failed']);
        }}
        onSubmit={() => setEvents((old) => [...old, 'submit'])}
      >
        <FormItem
          field={name}
          label="Name"
          tooltip="Enter a name"
          required
          help="Name help"
          extra="Name extra"
          rules={
            slow
              ? {
                  validator: (_value, callback) => {
                    return new Promise<void>((resolve) => {
                      pending.current.push((message) => {
                        callback(message);
                        resolve();
                      });
                    });
                  },
                }
              : { required: true, message: 'Name required' }
          }
        >
          <FieldInput
            value={model[name]}
            onChange={(value) => setModel({ ...model, [name]: value })}
          />
        </FormItem>
        <FormItem label="Settings" data-testid="nested-form-item">
          {nested && (
            <FormItem
              field="agree"
              noStyle
              rules={{ type: 'boolean', true: true, message: 'Agreement required' }}
            >
              <Switch
                value={model.agree}
                disabled={false}
                onChange={(value) => setModel({ ...model, agree: !!value })}
                aria-label="Form agreement"
              />
            </FormItem>
          )}
          <Button data-testid="form-inherited-button" disabled={false}>
            Inherited
          </Button>
        </FormItem>
        <FormItem field="second" hideLabel>
          <span>{model.second}</span>
        </FormItem>
        <button type="submit">Submit form</button>
      </Form>
      <button
        onClick={() => {
          void form.current?.validate().then((errors) => setResult(JSON.stringify(errors ?? null)));
        }}
      >
        Validate form
      </button>
      <button
        onClick={() => {
          void form.current
            ?.validateField(name)
            .then((errors) => setResult(JSON.stringify(errors ?? null)));
        }}
      >
        Validate name
      </button>
      <button
        onClick={() =>
          form.current?.setFields({
            first: { value: 'set first', status: 'error', message: 'Server first' },
            second: { value: 'set second' },
            agree: { value: true },
          })
        }
      >
        Set form fields
      </button>
      <button onClick={() => form.current?.resetFields()}>Reset form</button>
      <button onClick={() => form.current?.clearValidate()}>Clear form</button>
      <button onClick={() => setDisabled(!disabled)}>Disable form</button>
      <button onClick={() => setDynamic(!dynamic)}>Rename form field</button>
      <button onClick={() => setNested(!nested)}>Toggle nested field</button>
      <button onClick={() => setSlow(!slow)}>Slow form validator</button>
      <button
        onClick={() => pending.current.splice(0).forEach((callback) => callback('Late error'))}
      >
        Finish form validator
      </button>
      <output data-testid="form-model">{JSON.stringify(model)}</output>
      <output data-testid="form-result">{result}</output>
      <output data-testid="form-events">{events.join(',')}</output>
    </section>
  );
}
