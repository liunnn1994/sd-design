import { useRef, useState } from 'react';

import type { FormInstance } from '../../src/form';

import { Button } from '../../src/button';
import { Form, FormItem, useFormItem } from '../../src/form';
import { Switch } from '../../src/switch';

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
  const scenario = new URLSearchParams(location.search).get('scenario');
  const dynamicField = scenario === 'dynamic-field';
  const [mounted, setMounted] = useState(true);
  const [model, setModel] = useState({ first: '', second: 'initial', agree: false });
  const [disabled, setDisabled] = useState(false);
  const [name, setName] = useState<'' | 'first' | 'second'>(dynamicField ? '' : 'first');
  const [nested, setNested] = useState(!dynamicField);
  const [result, setResult] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [slow, setSlow] = useState(false);
  const pending = useRef<((message?: string) => void)[]>([]);
  const form = useRef<FormInstance>(null);
  const defer = (_value: unknown, callback: (message?: string) => void) =>
    new Promise<void>((resolve) => {
      pending.current.push((message) => {
        callback(message);
        resolve();
      });
    });
  return (
    <section data-testid="form-fixture">
      {mounted && (
        <Form
          ref={form}
          id="123:form"
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
            label={name === 'second' ? 'Replacement name' : 'Name'}
            labelAttrs={scenario === 'label-target' ? { htmlFor: 'alternate-name' } : undefined}
            tooltip="Enter a name"
            required
            help="Name help"
            extra="Name extra"
            validateTrigger={slow || dynamicField || scenario === 'rejection' ? [] : undefined}
            rules={
              slow
                ? { validator: defer }
                : scenario === 'rejection'
                  ? {
                      validator: async (value) => {
                        if (value !== 'good') throw new Error('Validation unavailable');
                      },
                    }
                  : { required: true, message: 'Name required' }
            }
          >
            <FieldInput
              value={name ? model[name] : ''}
              onChange={(value) => {
                if (name) setModel({ ...model, [name]: value });
              }}
            />
          </FormItem>
          {scenario === 'label-target' && <input id="alternate-name" aria-label="Alternate name" />}
          <FormItem label="Settings" data-testid="nested-form-item">
            {nested && (
              <FormItem
                field="agree"
                noStyle
                rules={
                  scenario === 'nested'
                    ? { validator: defer }
                    : {
                        type: 'boolean',
                        true: true,
                        message: 'Agreement required',
                      }
                }
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
          {!dynamicField && (
            <FormItem field="second" hideLabel>
              <span>{model.second}</span>
            </FormItem>
          )}
          <button type="submit">Submit form</button>
        </Form>
      )}
      <button
        onClick={() => {
          void form.current?.validate().then((errors) => setResult(JSON.stringify(errors ?? null)));
        }}
      >
        Validate form
      </button>
      <button
        onClick={() => {
          setResult('Pending');
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
      <button onClick={() => setMounted(!mounted)}>Toggle form</button>
      <button onClick={() => form.current?.clearValidate()}>Clear form</button>
      <button onClick={() => form.current?.scrollToField(name)}>Scroll to name</button>
      <button onClick={() => setDisabled(!disabled)}>Disable form</button>
      <button onClick={() => setName(name === 'second' ? 'first' : 'second')}>
        Rename form field
      </button>
      {dynamicField && (
        <>
          <button onClick={() => setName('first')}>Assign form field</button>
          <button onClick={() => setName('')}>Clear field path</button>
        </>
      )}
      <button onClick={() => setNested(!nested)}>Toggle nested field</button>
      <button onClick={() => setSlow(!slow)}>Slow form validator</button>
      <button
        onClick={() => pending.current.splice(0).forEach((callback) => callback('Late error'))}
      >
        Finish form validator
      </button>
      <button onClick={() => pending.current.splice(0).forEach((callback) => callback())}>
        Approve form validator
      </button>
      <button onClick={() => pending.current.pop()?.('Current error')}>
        Finish newest validation
      </button>
      <output data-testid="form-model">{JSON.stringify(model)}</output>
      <output data-testid="form-result">{result}</output>
      <output data-testid="form-events">{events.join(',')}</output>
    </section>
  );
}
