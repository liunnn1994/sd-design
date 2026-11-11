import { useRef, useState } from 'react';

import {
  InputNumber,
  Form,
  FormItem,
  type InputNumberInstance,
  type InputNumberValue,
} from '../../src/index';

export function InputNumberFixture() {
  const [value, setValue] = useState<InputNumberValue>(2);
  const [events, setEvents] = useState<string[]>([]);
  const [mode, setMode] = useState<'embed' | 'button'>('embed');
  const [readonly, setReadonly] = useState(false);
  const [max, setMax] = useState(5);
  const [formatted, setFormatted] = useState(false);
  const [mounted, setMounted] = useState(true);
  const ref = useRef<InputNumberInstance>(null);
  const record = (text: string) => setEvents((old) => [...old, text]);
  return (
    <section data-testid="number-fixture">
      <Form model={{ count: value }}>
        <FormItem field="count" label="Count">
          <InputNumber
            ref={ref}
            value={value}
            min={0}
            max={max}
            mode={mode}
            readonly={readonly}
            allowClear
            inputAttrs={{ 'aria-label': 'Model number' }}
            onValueChange={(next) => {
              setValue(next);
              record(`value:${next}`);
            }}
            onInput={(next, text) => record(`input:${next}:${text}`)}
            onChange={(next) => record(`change:${next}`)}
            onBlur={() => record('blur')}
            onClear={() => record('clear')}
          />
        </FormItem>
      </Form>
      <output data-testid="number-events">{events.join('|')}</output>
      <output data-testid="number-value">{String(value)}</output>
      <button onClick={() => setEvents([])}>Clear number events</button>
      <button onClick={() => setMode(mode === 'embed' ? 'button' : 'embed')}>
        Toggle number mode
      </button>
      <button onClick={() => setReadonly(!readonly)}>Toggle number readonly</button>
      <button onClick={() => setMax(max === 5 ? 1 : 5)}>Toggle number max</button>
      <button onClick={() => setValue(3)}>Set number externally</button>
      <button onClick={() => ref.current?.focus()}>Focus number ref</button>
      <InputNumber
        defaultValue="9007199254740993.125"
        stringMode
        step={0.001}
        inputAttrs={{ 'aria-label': 'Exact number' }}
      />
      <InputNumber
        defaultValue={12}
        formatter={formatted ? (val) => `$${val}` : undefined}
        parser={formatted ? (val) => val.replace('$', '') : undefined}
        inputAttrs={{ 'aria-label': 'Formatted number' }}
      />
      <button onClick={() => setFormatted(!formatted)}>Toggle number formatter</button>
      <InputNumber
        modelEvent="input"
        defaultValue={0}
        onValueChange={(next) => record(`live:${next}`)}
        inputAttrs={{ 'aria-label': 'Live number' }}
      />
      <InputNumber
        defaultValue={1}
        onKeyDown={(event) => event.preventDefault()}
        inputAttrs={{ 'aria-label': 'Prevented number' }}
      />
      {mounted && (
        <InputNumber
          defaultValue={0}
          onChange={(next) => record(`repeat:${next}`)}
          inputAttrs={{ 'aria-label': 'Repeat number' }}
        />
      )}
      <button onClick={() => setMounted(!mounted)}>Toggle repeat number</button>
    </section>
  );
}
