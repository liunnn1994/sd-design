import type { CascaderModelValue } from '@sdata/web-core/cascader/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { CascaderInstance } from '../../src/cascader/cascader.js';

import { Cascader } from '../../src/cascader/cascader.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import { Form, FormItem } from '../../src/form/index.js';
import '../../styles/select.scss';
import '../../styles/form.scss';
import '../../styles/checkbox.scss';
import '../../styles/radio.scss';
import '../../../web-core/styles/cascader/style/index.scss';

const options = [
  {
    value: 'root',
    label: 'Root',
    children: [
      { value: 'one', label: 'One' },
      { value: 'locked', label: 'Locked', disabled: true },
    ],
  },
];
function Fixture() {
  const reference = useRef<CascaderInstance>(null);
  const [model, setModel] = useState<{ choice: CascaderModelValue }>({ choice: '' });
  const [disabled, setDisabled] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  return (
    <ConfigProvider allowClear allowSearch>
      <button onClick={() => reference.current?.focus()}>Focus ref</button>
      <button onClick={() => reference.current?.blur()}>Blur ref</button>
      <button onClick={() => setDisabled(true)}>Disable form</button>
      <button onClick={() => setReadonly(true)}>Readonly multi</button>
      <Form
        model={model}
        disabled={disabled}
        size="large"
        rules={{ choice: [{ required: true, message: 'Choose a leaf' }] }}
      >
        <FormItem field="choice" label="Choice" validateTrigger={['blur', 'change']}>
          <Cascader
            ref={reference}
            data-testid="form-choice"
            value={model.choice}
            options={options}
            onValueChange={(choice) => setModel({ choice })}
            style={{ width: 260 }}
            onFocus={() => setEvents((items) => [...items, 'focus'])}
            onBlur={() => setEvents((items) => [...items, 'blur'])}
          />
        </FormItem>
      </Form>
      <Cascader
        data-testid="multi"
        options={options}
        multiple
        readonly={readonly}
        defaultValue={['one', 'locked']}
        onChange={(next) => setEvents((items) => [...items, `multi:${JSON.stringify(next)}`])}
        onClear={() => setEvents((items) => [...items, 'clear'])}
        style={{ width: 280 }}
      />
      <Cascader
        data-testid="optout"
        options={options}
        allowSearch={false}
        allowClear={false}
        defaultValue="one"
        style={{ width: 260 }}
      />
      <Cascader
        options={options}
        style={{ width: 180 }}
        renderTrigger={(state) => (
          <button data-testid="width-trigger">{state.displayValue || 'Custom'}</button>
        )}
      />
      <output data-testid="model">{JSON.stringify(model)}</output>
      <output data-testid="events">{events.join('|')}</output>
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
