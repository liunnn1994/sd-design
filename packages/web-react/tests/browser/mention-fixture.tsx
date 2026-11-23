import { useEffect, useRef, useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Form, FormItem } from '../../src/form/index.js';
import { Mention, type MentionInstance } from '../../src/mention/index.js';
const choices = [
  {
    isGroup: true as const,
    label: 'People',
    options: [
      'Alice',
      'Bob',
      { value: 0, label: 'Zero' },
      { value: 'blocked', label: 'Blocked', disabled: true },
    ],
  },
];
export function MentionFixture() {
  const [type, setType] = useState<'input' | 'textarea'>('input');
  const [readonly, setReadonly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [controlled, setControlled] = useState<string>();
  const [data, setData] = useState(choices);
  const [filter, setFilter] = useState(true);
  const [split, setSplit] = useState(' ');
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [model, setModel] = useState({ mention: '' });
  const instance = useRef<MentionInstance>(null);
  const log = (value: string) => setEvents((old) => [...old, value]);
  useEffect(() => {
    const action = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (value === 'textarea') setType('textarea');
      if (value === 'input') setType('input');
      if (value === 'readonly') setReadonly((old) => !old);
      if (value === 'disabled') setDisabled((old) => !old);
      if (value === 'controlled') setControlled('@a old');
      if (value === 'tail') setControlled('@a new');
      if (value === 'release') setControlled(undefined);
      if (value === 'empty') setData([]);
      if (value === 'reload') setData(choices);
      if (value === 'filter') setFilter((old) => !old);
      if (value === 'split') setSplit(':');
      if (value === 'reset-log') setEvents([]);
    };
    window.addEventListener('mention-action', action);
    setReady(true);
    return () => window.removeEventListener('mention-action', action);
  }, []);
  return (
    <section data-testid="mention-fixture" data-ready={ready}>
      <Mention
        ref={instance}
        data-testid="mention-main"
        modelValue={controlled}
        type={type}
        prefix={['@', '#']}
        split={split}
        data={data}
        filterOption={filter}
        readonly={readonly ? 'Mention is readonly' : false}
        disabled={disabled}
        allowClear
        prefixContent={<span>To</span>}
        suffix={<span>End</span>}
        textareaAttrs={{ 'style': { width: 300, height: 100 }, 'aria-label': 'Mention textarea' }}
        inputAttrs={{ 'aria-label': 'Mention input' }}
        style={{ width: 320 }}
        renderOption={(option) => <strong>{option.label}</strong>}
        onSearch={(value, prefix) => log(`search:${prefix}:${value}`)}
        onValueChange={(value) => log(`update:${value}`)}
        onChange={(value) => log(`change:${value}`)}
        onSelect={(value) => log(`select:${value}`)}
        onClear={() => log('clear')}
      />
      <button onClick={() => instance.current?.focus()}>Mention focus</button>
      <button onClick={() => instance.current?.blur()}>Mention blur</button>
      <ConfigProvider allowClear>
        <Mention data-testid="mention-config" defaultValue="Keep" data={['Alice']} />
        <Mention data-testid="mention-no-clear" defaultValue="Keep" allowClear={false} />
      </ConfigProvider>
      <Mention
        data-testid="mention-custom-filter"
        prefix="::"
        split=""
        data={['First', 'Second']}
        filterOption={(query, option) => query === 'two words' && option.value === 'Second'}
      />
      <Mention
        data-testid="mention-empty"
        data={[{ value: '', label: 'Empty value' }]}
        onSelect={(value) => log(`empty:${value}`)}
        onInput={() => log('native-input')}
        inputAttrs={{ onKeyDown: () => log('native-keydown') }}
      />
      <Form model={model} onModelChange={(next) => setModel(next as typeof model)}>
        <FormItem
          field="mention"
          rules={[{ required: true, message: 'Mention required' }]}
          validateTrigger={['change', 'blur']}
        >
          <Mention
            data-testid="mention-form"
            value={model.mention}
            onValueChange={(mention) => setModel({ mention })}
            data={['Alice']}
            allowClear
          />
        </FormItem>
      </Form>
      <output data-testid="mention-events">{events.join('|')}</output>
    </section>
  );
}
