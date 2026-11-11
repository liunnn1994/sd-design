import { useRef, useState } from 'react';

import {
  InputTag,
  ConfigProvider,
  Form,
  FormItem,
  type InputTagInstance,
  type InputTagValue,
} from '../../src/index';

export function InputTagFixture() {
  const [events, setEvents] = useState<string[]>([]);
  const [responsive, setResponsive] = useState(false);
  const [wide, setWide] = useState(false);
  const [input, setInput] = useState('kept');
  const [external, setExternal] = useState<InputTagValue | undefined>(['external']);
  const [values, setValues] = useState<InputTagValue>([]);
  const [ordered, setOrdered] = useState<InputTagValue>(['first', 'second', 'third']);
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
        prefix={<b>Prefix</b>}
        suffix={<b>Suffix</b>}
      />
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
      <output data-testid="tag-events">{events.join('|')}</output>
    </section>
  );
}
