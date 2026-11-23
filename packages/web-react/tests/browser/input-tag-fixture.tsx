import { useRef, useState } from 'react';

import type { InputTagInstance, InputTagValue } from '../../src/input-tag';

import { ConfigProvider } from '../../src/config-provider';
import { Form, FormItem } from '../../src/form';
import { InputTag } from '../../src/input-tag';

export function InputTagFixture() {
  const [events, setEvents] = useState<string[]>([]);
  const [responsive, setResponsive] = useState(false);
  const [wide, setWide] = useState(false);
  const [input, setInput] = useState('kept');
  const [external, setExternal] = useState<InputTagValue | undefined>(['external']);
  const [values, setValues] = useState<InputTagValue>([]);
  const [ordered, setOrdered] = useState<InputTagValue>(['first', 'second', 'third']);
  const [prefix, setPrefix] = useState(true);
  const [suffix, setSuffix] = useState(true);
  const [remapped, setRemapped] = useState(false);
  const [guard, setGuard] = useState<'disabled' | 'readonly'>();
  const instance = useRef<InputTagInstance>(null);
  const record = (value: string) => setEvents((list) => [...list, value]);
  return (
    <section data-testid="input-tag-fixture">
      <button onClick={() => setOrdered([...ordered].reverse())}>Reverse tag order</button>
      <button onClick={() => setOrdered(['first', 'second', 'third'])}>Restore tag order</button>
      <InputTag
        data-testid="tags-ordered"
        value={ordered}
        onValueChange={setOrdered}
        style={{ width: 500 }}
        renderTag={(raw) => <b>{raw.label}</b>}
        name="ordered-tags"
        maxLength={8}
        onPaste={(event) => record(`paste:${event.currentTarget.tagName}`)}
      />
      <InputTag
        data-testid="tags-basic"
        defaultValue={['one', 'two']}
        uniqueValue
        allowClear
        placeholder="Add tags"
        onValueChange={(value) => record(`update:${JSON.stringify(value)}`)}
        onChange={(value) => record(`change:${JSON.stringify(value)}`)}
        onPressEnter={(value) => record(`enter:${value}`)}
        onRemove={(value) => record(`remove:${value}`)}
        onClear={() => record('clear')}
      />
      <InputTag
        data-testid="tags-disabled-input"
        disabledInput
        allowClear
        defaultValue={['Existing']}
        placeholder="Choose tags"
        onChange={(value) => record(`locked-input-change:${JSON.stringify(value)}`)}
        onFocus={() => record('locked-input-focus')}
        onBlur={() => record('locked-input-blur')}
      />
      <InputTag
        data-testid="tags-controlled"
        value={['fixed']}
        inputValue={input}
        onInputValueChange={(value) => record(`input:${value}`)}
        onValueChange={(value) => record(`controlled:${JSON.stringify(value)}`)}
      />
      <button onClick={() => setInput('reset')}>Reset tag input</button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setResponsive(!responsive)}
      >
        Toggle tag layout
      </button>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => setWide(!wide)}>
        Resize tags
      </button>
      <button onClick={() => instance.current?.focus()}>Focus tag input</button>
      <InputTag
        data-testid="tags-responsive"
        ref={instance}
        defaultValue={['one', 'two', 'three', 'four']}
        defaultInputValue="draft"
        retainInputValue
        maxTagCount={responsive ? 'responsive' : 2}
        style={{ width: wide ? 650 : 180 }}
      />
      <InputTag
        data-testid="tags-mapped"
        defaultValue={[
          { id: 4, title: 'Mapped', remove: false, tag: { color: 'red' } },
          {
            id: 5,
            title: 'Closable',
            remove: true,
            tag: { onClose: () => record('mapped-close') },
          },
        ]}
        fieldNames={{ value: 'id', label: 'title', closable: 'remove', tagProps: 'tag' }}
        formatTag={(raw) => `Label:${raw.title}`}
        tagNowrap
        inputAttrs={{
          'aria-label': 'Mapped tag input',
          'className': 'custom-tag-input',
          'style': { color: 'rgb(12, 34, 56)' },
        }}
      />
      <InputTag
        data-testid="tags-retained"
        retainInputValue={{ create: true, blur: false }}
        fitWidth
        placeholder="Enter value"
        prefix={prefix ? <b>Prefix</b> : undefined}
        suffix={suffix ? <b>Suffix</b> : undefined}
      />
      <InputTag
        data-testid="tags-retain-blur"
        defaultInputValue="initial draft"
        retainInputValue={{ blur: true }}
        onValueChange={(value) => record(`initial-draft:${JSON.stringify(value)}`)}
      />
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => setPrefix(!prefix)}>
        Toggle tag prefix
      </button>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => setSuffix(!suffix)}>
        Toggle tag suffix
      </button>
      <InputTag
        data-testid="tags-live-mapping"
        defaultValue={[
          {
            value: 'original',
            label: 'Default label',
            id: 'existing',
            title: 'Mapped label',
            closable: true,
          },
        ]}
        fieldNames={remapped ? { value: 'id', label: 'title' } : undefined}
        uniqueValue
        onValueChange={(value) => record(`mapped-update:${value.length}`)}
        onPressEnter={(value) => record(`mapped-enter:${value}`)}
        onRemove={(value) => record(`mapped-remove:${value}`)}
      />
      <button onClick={() => setRemapped(true)}>Change tag mapping</button>
      <InputTag
        data-testid="tags-readonly"
        readonly="Tags are locked"
        defaultValue={['locked']}
        allowClear
      />
      <InputTag data-testid="tags-external" value={external} onValueChange={setExternal} />
      <button onClick={() => setExternal(undefined)}>Release tag model</button>
      <Form model={{ tags: values }}>
        <FormItem field="tags" rules={[{ required: true, message: 'Tags required' }]}>
          <InputTag data-testid="tags-form" value={values} onValueChange={setValues} allowClear />
        </FormItem>
      </Form>
      <ConfigProvider size="small" allowClear>
        <Form disabled model={{}}>
          <FormItem>
            <InputTag data-testid="tags-disabled" defaultValue={['disabled']} />
            <InputTag
              data-testid="tags-uninjected"
              uninjectFormItemContext
              defaultValue={['enabled']}
            />
          </FormItem>
        </Form>
      </ConfigProvider>
      <InputTag
        data-testid="tags-counter-identity"
        defaultValue={['__sd__more', 'second', 'hidden']}
        maxTagCount={2}
        onValueChange={(value) => record(`counter:${JSON.stringify(value)}`)}
      />
      <InputTag
        data-testid="tags-removal"
        defaultValue={[
          'removable',
          { value: 'locked', label: 'Locked', closable: true, tagProps: { closable: false } },
        ]}
        onRemove={(value) => record(`boundary:${value}`)}
      />
      <InputTag
        data-testid="tags-guarded"
        defaultValue={[{ value: 'keep', label: 'Keep', tagProps: { closable: true } }]}
        disabled={guard === 'disabled'}
        readonly={guard === 'readonly'}
        onRemove={(value) => record(`guarded:${value}`)}
      />
      <button onClick={() => setGuard('disabled')}>Disable guarded tags</button>
      <button onClick={() => setGuard('readonly')}>Make guarded tags readonly</button>
      <button onClick={() => setGuard(undefined)}>Enable guarded tags</button>
      <output data-testid="tag-events">{events.join('|')}</output>
    </section>
  );
}
