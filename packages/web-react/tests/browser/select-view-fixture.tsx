import { useRef, useState } from 'react';

import { InputLabel } from '../../src/_shared/input-label';
import { SelectView, type SelectViewValue } from '../../src/_shared/select-view';
import { FormItemContext } from '../../src/form/context';
import { ConfigProvider, type InputTagInstance } from '../../src/index';

const initial: SelectViewValue[] = [
  { value: 1, label: 'One', closable: true },
  { value: 2, label: 'Two', closable: true },
];
export function SelectViewFixture() {
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState(false);
  const [multiple, setMultiple] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const instance = useRef<InputTagInstance>(null);
  const record = (event: string) => setEvents((list) => [...list, event]);
  return (
    <ConfigProvider allowClear>
      <section data-testid="select-view-fixture">
        <button onClick={() => setMultiple(!multiple)}>Toggle selection mode</button>
        <button onMouseDown={(event) => event.preventDefault()} onClick={() => setOpened(!opened)}>
          Toggle view open
        </button>
        <button
          onClick={() => {
            setOpened(true);
            instance.current?.focus();
          }}
        >
          Focus selection
        </button>
        <button onClick={() => setLoading(!loading)}>Toggle selection loading</button>
        <button onClick={() => setSearch(!search)}>Toggle selection search</button>
        <button onClick={() => setDisabled(!disabled)}>Toggle selection disabled</button>
        <button
          onClick={() => {
            setValue(initial);
            setQuery('');
          }}
        >
          Reset selection view
        </button>
        <FormItemContext.Provider
          value={{
            fieldId: 'selection',
            disabled,
            error: false,
            eventHandlers: {
              onFocus: () => record('form-focus'),
              onBlur: () => record('form-blur'),
            },
            updateValidateState() {},
          }}
        >
          <div onClick={() => record('bubbled')}>
            <SelectView
              data-testid="select-view"
              ref={instance}
              value={value}
              inputValue={query}
              onInputValueChange={setQuery}
              opened={opened}
              multiple={multiple}
              loading={loading}
              allowSearch={search}
              allowClear
              placeholder="Choose"
              fitWidth
              inputAttrs={{
                'role': 'combobox',
                'aria-label': 'Selection query',
                'aria-expanded': opened,
              }}
              onClear={(event) => {
                event.stopPropagation();
                record('clear');
                setValue([]);
              }}
              onRemove={(removed) => {
                record(`remove:${removed}`);
                setValue(value.filter((item) => item.value !== removed));
              }}
              onFocus={() => record('view-focus')}
              onBlur={() => record('view-blur')}
            />
          </div>
        </FormItemContext.Provider>
        <SelectView
          data-testid="select-view-no-clear"
          multiple
          value={initial}
          allowClear={false}
          allowSearch={false}
          showArrow={false}
          arrowIcon={<b>Custom arrow</b>}
          renderLabel={(item) => <b>Custom {item.label}</b>}
        />
        <SelectView
          data-testid="select-view-create"
          value={[]}
          allowSearch={false}
          allowCreate
          inputAttrs={{ 'aria-label': 'Create selection' }}
        />
        <InputLabel
          data-testid="input-label-controlled"
          value={initial[0]}
          inputValue="fixed"
          enabledInput
          inputAttrs={{
            'aria-label': 'Controlled label query',
            'className': 'label-custom',
            'style': { color: 'rgb(12, 34, 56)' },
          }}
          onInputValueChange={(text) => record(`label:${text}`)}
        />
        <output data-testid="view-events">{events.join('|')}</output>
        <output data-testid="view-query">{query}</output>
      </section>
    </ConfigProvider>
  );
}
