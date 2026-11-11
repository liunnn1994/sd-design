import { useRef, useState } from 'react';

import {
  Select,
  ConfigProvider,
  Form,
  FormItem,
  type SelectInstance,
  type SelectModelValue,
  type SelectOption,
} from '../../src/index';

const options: SelectOption[] = [
  { value: '', label: 'Empty choice' },
  { value: 0, label: 'Zero' },
  { value: false, label: 'False' },
  { value: 'locked', label: 'Locked', disabled: true },
  {
    isGroup: true,
    label: 'Letters',
    options: [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ],
  },
];
const many = Array.from({ length: 500 }, (_, value) => ({ value, label: `Choice ${value}` }));
export function SelectFixture() {
  const [value, setValue] = useState<SelectModelValue>('');
  const [multiple, setMultiple] = useState<SelectModelValue>(['locked']);
  const [events, setEvents] = useState<string[]>([]);
  const [readonly, setReadonly] = useState<boolean | string>('Selection locked');
  const [shown, setShown] = useState(true);
  const [objectValue, setObjectValue] = useState<SelectModelValue>({ id: 2 });
  const [renamed, setRenamed] = useState(false);
  const [model, setModel] = useState<Record<string, unknown>>({ choice: '' });
  const [providerVirtual, setProviderVirtual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState<SelectModelValue>('a');
  const [switchMultiple, setSwitchMultiple] = useState(false);
  const instance = useRef<SelectInstance>(null);
  const record = (event: string) => setEvents((events) => [...events, event]);
  return (
    <section data-testid="select-fixture">
      <style>{'.select-width-from-class { width: 180px; }'}</style>
      <Select
        data-testid="select-class-width"
        className="select-width-from-class"
        options={options}
      />
      <Select
        data-testid="select-switch-mode"
        className="select-width-from-class"
        options={options}
        defaultValue="a"
        multiple={switchMultiple}
      />
      <button onClick={() => setSwitchMultiple(!switchMultiple)}>Select switch mode</button>
      <Select
        data-testid="select-single"
        ref={instance}
        value={value}
        options={options}
        style={{ width: 260 }}
        onValueChange={(next) => {
          record(`value:${JSON.stringify(next)}`);
          setValue(next);
        }}
        onChange={(next) => record(`change:${JSON.stringify(next)}`)}
        onPopupVisibleChange={(next) => record(`popup:${next}`)}
        onClear={() => record('clear')}
      />
      <button onClick={() => instance.current?.focus()}>Select focus</button>
      <button onClick={() => instance.current?.blur()}>Select blur</button>
      <output data-testid="select-value">{JSON.stringify(value)}</output>
      <output data-testid="select-events">{events.join('|')}</output>
      <Select
        data-testid="select-multiple"
        multiple
        value={multiple}
        options={options}
        style={{ width: 320 }}
        limit={2}
        onValueChange={setMultiple}
        onExceedLimit={(next) => record(`limit:${next}`)}
        onRemove={(next) => record(`remove:${next}`)}
      />
      <output data-testid="select-multiple-value">{JSON.stringify(multiple)}</output>
      <Select
        data-testid="select-rejected"
        value={0}
        inputValue=""
        options={options}
        style={{ width: 200 }}
        onValueChange={(next) => record(`rejected:${JSON.stringify(next)}`)}
      />
      {shown && (
        <Select
          data-testid="select-create"
          allowCreate
          multiple
          options={['Existing']}
          searchDelay={100}
          style={{ width: 240 }}
          onSearch={(next) => record(`search:${next}`)}
          onChange={(next) => record(`created:${JSON.stringify(next)}`)}
        />
      )}
      <button onClick={() => setShown(!shown)}>Select mount create</button>
      <Select
        data-testid="select-retain"
        options={options}
        allowSearch={{ retainInputValue: true }}
        style={{ width: 220 }}
      />
      <Select
        data-testid="select-readonly"
        readonly={readonly}
        options={options}
        style={{ width: 200 }}
      />
      <button onClick={() => setReadonly(readonly ? false : 'Selection locked')}>
        Select readonly
      </button>
      <Select
        data-testid="select-objects"
        value={objectValue}
        onValueChange={setObjectValue}
        valueKey="id"
        fieldNames={{
          value: renamed ? 'newId' : 'code',
          label: renamed ? 'newLabel' : 'name',
          children: 'entries',
        }}
        options={
          renamed
            ? [
                { newId: { id: 2 }, newLabel: 'Updated two' },
                { newId: { id: 3 }, newLabel: 'Updated three' },
              ]
            : [
                {
                  name: 'Objects',
                  entries: [
                    { code: { id: 2 }, name: 'Object two' },
                    { code: { id: 3 }, name: 'Object three' },
                  ],
                },
              ]
        }
        renderLabel={(data) => `Selected ${data[renamed ? 'newLabel' : 'name']}`}
        style={{ width: 220 }}
      />
      <button onClick={() => setRenamed(!renamed)}>Select fields</button>
      <output data-testid="select-object-value">{JSON.stringify(objectValue)}</output>
      <ConfigProvider
        virtualListProps={providerVirtual ? { height: 120, itemSize: 36 } : undefined}
        selectSpinProps={{ tip: 'Provider loading' }}
        renderEmpty={({ component }) => <span>Empty for {component}</span>}
      >
        <Select
          data-testid="select-virtual"
          options={many}
          loading={loading}
          defaultValue={400}
          style={{ width: 240 }}
        />
        <Select
          data-testid="select-provider-empty"
          options={[]}
          virtualListProps={undefined}
          header="Empty header"
          footer="Empty footer"
          showHeaderOnEmpty
          showFooterOnEmpty
          style={{ width: 200 }}
        />
      </ConfigProvider>
      <button onClick={() => setProviderVirtual(!providerVirtual)}>Select virtual config</button>
      <button onClick={() => setLoading(!loading)}>Select loading</button>
      <Select
        options={options}
        show={customOpen}
        onShowChange={setCustomOpen}
        value={customValue}
        onValueChange={setCustomValue}
        onPopupVisibleChange={(next) => record(`custom-popup:${next}`)}
        renderTrigger={(state) => (
          <button data-testid="select-custom">
            Chosen {String(state.displayValue)} / {String(state.popupVisible)}
          </button>
        )}
        style={{ width: 240 }}
      />
      <ConfigProvider allowSearch>
        <Select
          data-testid="select-no-search"
          options={options}
          defaultActiveFirstOption={false}
          defaultValue={null}
          allowSearch={false}
          onChange={(next) => record(`no-search:${JSON.stringify(next)}`)}
          style={{ width: 220 }}
        />
      </ConfigProvider>
      <Select
        data-testid="select-scroll"
        options={many.slice(0, 40)}
        style={{ width: 220 }}
        scrollbar={{
          className: 'custom-select-scroll',
          style: { maxHeight: 90 },
          onScroll: () => record('custom-scroll'),
        }}
        onDropdownReachBottom={() => record('reached')}
        onDropdownScroll={() => record('scrolled')}
      />
      <div style={{ width: 400 }}>
        <Select
          data-testid="select-fit"
          options={['Short', 'A much longer option label']}
          defaultValue="Short"
          fitWidth
        />
      </div>
      <Form
        model={model}
        onModelChange={setModel}
        rules={{ choice: [{ required: true, message: 'Choose one' }] }}
      >
        <FormItem field="choice" label="Select form" validateTrigger={['blur', 'change']}>
          <Select
            data-testid="select-form"
            value={model.choice as SelectModelValue}
            onValueChange={(next) => setModel({ choice: next })}
            options={['Form A', 'Form B']}
            style={{ width: 220 }}
          />
        </FormItem>
      </Form>
    </section>
  );
}
