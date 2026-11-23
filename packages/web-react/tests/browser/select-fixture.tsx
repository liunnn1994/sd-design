import { useRef, useState } from 'react';

import type { SelectInstance, SelectModelValue, SelectOption } from '../../src/select';

import { ConfigProvider } from '../../src/config-provider';
import { Form, FormItem } from '../../src/form';
import { Select } from '../../src/select';

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
  const [switchBordered, setSwitchBordered] = useState(true);
  const [formDisabled, setFormDisabled] = useState(false);
  const [openGuard, setOpenGuard] = useState(false);
  const [remoteOptions, setRemoteOptions] = useState<SelectOption[]>([]);
  const [remotePending, setRemotePending] = useState(false);
  const [fallback, setFallback] = useState({ id: 1, label: 'Original fallback' });
  const [regions, setRegions] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(true);
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
        bordered={switchBordered}
      />
      <button onClick={() => setSwitchMultiple(!switchMultiple)}>Select switch mode</button>
      <button onClick={() => setSwitchBordered(!switchBordered)}>Toggle select border</button>
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
      <Select
        data-testid="select-parent-fallback"
        value={fallback}
        valueKey="id"
        fallbackOption={(value) => ({ value, label: (value as typeof fallback).label })}
      />
      <button onClick={() => setFallback({ ...fallback, label: 'Updated fallback' })}>
        Replace Select fallback object
      </button>
      {new URLSearchParams(location.search).has('regions') && (
        <>
          <button onClick={() => setRegions(!regions)}>Toggle Select regions</button>
          <button onClick={() => setRegionsOpen(!regionsOpen)}>Toggle Select regions popup</button>
          <Select
            options={['Retained choice']}
            popupVisible={regionsOpen}
            unmountOnClose
            header={regions ? <span>Live header</span> : undefined}
            footer={regions ? <span>Live footer</span> : undefined}
          />
        </>
      )}
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
      <button onClick={() => setFormDisabled(!formDisabled)}>Toggle Select Form disabled</button>
      <button onClick={() => setOpenGuard(!openGuard)}>Toggle guarded popup</button>
      <Form model={{}} disabled={formDisabled}>
        <FormItem>
          <Select
            data-testid="select-form-guard"
            popupVisible={openGuard}
            readonly={readonly ? 'Selection locked' : false}
            options={['Guard A', 'Guard B']}
            defaultValue="Guard A"
            onChange={(next) => record(`guard:${JSON.stringify(next)}`)}
            style={{ width: 220 }}
          />
        </FormItem>
      </Form>
      <Select
        data-testid="select-remote"
        options={remoteOptions}
        filterOption={false}
        loading={remotePending}
        searchDelay={60}
        spinProps={{ tip: 'Loading matches' }}
        style={{ width: 220 }}
        onChange={(value) => record(`remote:${JSON.stringify(value)}`)}
        onSearch={async (next) => {
          setRemotePending(true);
          try {
            const response = await fetch(`/select-search?q=${encodeURIComponent(next)}`);
            setRemoteOptions(await response.json());
          } finally {
            setRemotePending(false);
          }
        }}
      />
      <Select
        data-testid="select-group-filter"
        options={[
          { isGroup: true, label: 'Greek', options: [{ value: 'a', label: 'Alpha' }] },
          { isGroup: true, label: 'English', options: [{ value: 'b', label: 'Bravo' }] },
        ]}
        filterOption={(query, option) => String(option.value).includes(query)}
        renderOption={(option) => <strong>Choice {option.label}</strong>}
        header={<span>Choice list header</span>}
        footer={<span>Choice list footer</span>}
        empty={<span>No matching value</span>}
        showHeaderOnEmpty
        showFooterOnEmpty
        style={{ width: 240 }}
      />
      <Select
        data-testid="select-tag-overflow"
        multiple
        options={options}
        defaultValue={['a', 'b', 0]}
        maxTagCount={1}
        renderTag={(option) => <strong>Selected {option.label}</strong>}
        onChange={(value) => record(`overflow:${JSON.stringify(value)}`)}
        style={{ width: 240 }}
      />
    </section>
  );
}
