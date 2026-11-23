import { useEffect, useRef, useState } from 'react';

import { AutoComplete, type AutoCompleteInstance } from '../../src/auto-complete/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import { Form, FormItem } from '../../src/form/index.js';
const data = [
  { value: 'Alpha', label: 'Alpha' },
  { value: 'locked', label: 'Locked', disabled: true },
  0,
  {
    isGroup: true,
    label: 'Letters',
    options: [
      { value: 'Beta', label: 'Beta' },
      { value: 'bravo', label: 'bravo' },
    ],
  },
];
const many = Array.from({ length: 500 }, (_, index) => `Item ${index}`);
export function AutoCompleteFixture() {
  const [released, setReleased] = useState<string | undefined>('Alpha');
  const [value, setValue] = useState('');
  const [strict, setStrict] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [shown, setShown] = useState(true);
  const [remote, setRemote] = useState(['Remote']);
  const [events, setEvents] = useState<string[]>([]);
  const [model, setModel] = useState({ choice: '' });
  const control = useRef<AutoCompleteInstance>(null);
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (
        event as CustomEvent<{ remote?: string[]; disabled?: boolean; readonly?: boolean }>
      ).detail;
      if (detail.remote !== undefined) setRemote(detail.remote);
      if (detail.disabled !== undefined) setDisabled(detail.disabled);
      if (detail.readonly !== undefined) setReadonly(detail.readonly);
    };
    window.addEventListener('auto-complete-update', update);
    return () => window.removeEventListener('auto-complete-update', update);
  }, []);
  const log = (event: string) => setEvents((old) => [...old, event]);
  return (
    <section data-testid="auto-fixture">
      <style>{'.auto-width-class { width: 180px; }'}</style>
      {shown && (
        <AutoComplete
          data-testid="auto-main"
          className="auto-width-class"
          ref={control}
          value={value}
          onValueChange={(next) => {
            log(`value:${next}`);
            setValue(next);
          }}
          onChange={(next) => log(`change:${next}`)}
          onSearch={(next) => log(`search:${next}`)}
          onSelect={(next) => log(`select:${next}`)}
          onClear={() => log('clear')}
          data={data}
          allowClear
          strict={strict}
          disabled={disabled}
          readonly={readonly ? 'Locked autocomplete' : false}
          footer={<span>Suggestions footer</span>}
        />
      )}
      <AutoComplete
        data-testid="auto-rejected"
        value=""
        data={data}
        onValueChange={(next) => log(`rejected:${next}`)}
      />
      <AutoComplete
        data-testid="auto-remote"
        data={remote}
        filterOption={false}
        onSelect={(next) => log(`remote:${next}`)}
      />
      <AutoComplete
        data-testid="auto-custom"
        data={[...data, { value: '', label: 'Empty' }]}
        filterOption={(input, option) =>
          String(option.value).toLowerCase().startsWith(input.toLowerCase())
        }
        renderOption={(option) => `${option.index}:${option.raw.label ?? option.value}`}
      />
      <ConfigProvider allowClear virtualListProps={{ height: 120, itemSize: 36 }}>
        <AutoComplete
          data-testid="auto-virtual"
          defaultValue="Item 400"
          data={many}
          filterOption={false}
          onDropdownScroll={() => log('scroll')}
          onDropdownReachBottom={() => log('bottom')}
        />
        <AutoComplete
          data-testid="auto-optout"
          defaultValue="Alpha"
          data={data}
          virtualListProps={undefined}
          allowClear={false}
        />
      </ConfigProvider>
      <AutoComplete
        data-testid="auto-release"
        value={released}
        defaultValue="Initial"
        data={data}
      />
      <button onClick={() => setReleased(undefined)}>Auto release</button>
      <AutoComplete
        data-testid="auto-scroll"
        data={many.slice(0, 80)}
        filterOption={false}
        onDropdownScroll={() => log('normal-scroll')}
        onDropdownReachBottom={() => log('normal-bottom')}
      />
      <div id="auto-popup-host">
        <AutoComplete
          data-testid="auto-contained"
          data={['Inside']}
          popupContainer="#auto-popup-host"
        />
      </div>
      <Form model={model} onModelChange={(next) => setModel(next as typeof model)}>
        <FormItem
          field="choice"
          rules={[{ required: true, message: 'Choose a suggestion' }]}
          validateTrigger={['change', 'blur']}
        >
          <AutoComplete
            data-testid="auto-form"
            value={model.choice}
            onValueChange={(choice) => setModel({ choice })}
            data={['valid']}
            allowClear
          />
        </FormItem>
      </Form>
      <button onClick={() => setStrict((old) => !old)}>Auto strict</button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setDisabled((old) => !old)}
      >
        Auto disabled
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setReadonly((old) => !old)}
      >
        Auto readonly
      </button>
      <button onClick={() => setShown((old) => !old)}>Auto mount</button>
      <button onClick={() => setValue('Beta')}>Auto external</button>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => setRemote([])}>
        Auto empty
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setRemote(['Reloaded'])}
      >
        Auto reload
      </button>
      <button onClick={() => control.current?.focus()}>Auto focus</button>
      <button onClick={() => control.current?.blur()}>Auto blur</button>
      <output data-testid="auto-value">{value}</output>
      <output data-testid="auto-events">{events.join('|')}</output>
    </section>
  );
}
